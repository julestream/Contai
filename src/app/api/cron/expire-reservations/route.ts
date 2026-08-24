import { createAdminClient } from '@/lib/supabase/admin'
import { notifyReservationExpired } from '@/lib/notify'
import { NextResponse } from 'next/server'

// Runs on a schedule (see vercel.json). Finds reservations whose 48-hour
// window has passed without a handover, releases the artwork back to Browse,
// and tells both sides.
//
// Refunds are NOT issued here. The reservation is marked `reservation_expired`
// and appears in the admin handover tracker; the refund is made by hand in
// Stripe and the status becomes `refunded` at that point. Two separate states,
// so nothing ever claims a buyer was refunded before the money actually moved.

export const dynamic = 'force-dynamic'
export const maxDuration = 60

// Only these can lapse. A completed handover, a reported issue, or an
// already-expired reservation are all left alone.
const EXPIRABLE = ['reservation_paid', 'scheduling_in_progress', 'ready_for_pickup']

export async function GET(request: Request) {
  // Vercel Cron sends a bearer token. Anyone else gets nothing — otherwise
  // this endpoint would be a public button for cancelling reservations.
  const secret = process.env.CRON_SECRET
  const auth = request.headers.get('authorization')
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const admin = createAdminClient()
  const now = new Date().toISOString()

  const { data: due, error: findErr } = await admin
    .from('reservations')
    .select('id, artwork_id, status, reservation_expires_at')
    .in('status', EXPIRABLE)
    .lt('reservation_expires_at', now)
    .not('reservation_expires_at', 'is', null)

  if (findErr) {
    console.error('[cron/expire] lookup failed:', findErr.message)
    return NextResponse.json({ error: findErr.message }, { status: 500 })
  }

  if (!due || due.length === 0) {
    return NextResponse.json({ ok: true, expired: 0 })
  }

  const expired: string[] = []
  const failed: string[] = []

  for (const res of due) {
    // Guard against two runs overlapping: only move it if it is still in
    // an expirable state right now.
    const { data: updated, error: updErr } = await admin
      .from('reservations')
      .update({ status: 'reservation_expired' })
      .eq('id', res.id)
      .in('status', EXPIRABLE)
      .select('id')

    if (updErr) {
      console.error(`[cron/expire] ${res.id} update failed:`, updErr.message)
      failed.push(res.id)
      continue
    }

    // Empty means another run got there first. Nothing more to do.
    if (!updated || updated.length === 0) continue

    // Put the work back on Browse — but only if it is still marked reserved.
    // If the artist has since hidden or removed it, that decision stands.
    if (res.artwork_id) {
      const { error: artErr } = await admin
        .from('artworks')
        .update({ status: 'live' })
        .eq('id', res.artwork_id)
        .eq('status', 'reserved')

      if (artErr) {
        console.error(`[cron/expire] artwork ${res.artwork_id} release failed:`, artErr.message)
      }
    }

    // Emails swallow their own failures, so this cannot break the loop.
    await notifyReservationExpired(res.id)

    expired.push(res.id)
  }

  console.log(`[cron/expire] expired ${expired.length}, failed ${failed.length}`)

  return NextResponse.json({
    ok: true,
    expired: expired.length,
    failed: failed.length,
    ids: expired,
  })
}