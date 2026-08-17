import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { notifyMeeting } from '@/lib/notify'
import { NextResponse } from 'next/server'

// Scheduling a handoff. Either side may propose a time; the *other* side
// confirms it. The pickup address is only released once both have agreed,
// so paying alone never discloses where an artist lives.
export async function POST(request: Request) {
  try {
    const { reservationId, action, meetingAt } = await request.json()

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const admin = createAdminClient()

    const { data: reservation } = await admin
      .from('reservations')
      .select('*, artworks(artist_id)')
      .eq('id', reservationId)
      .single()

    if (!reservation) {
      return NextResponse.json({ error: 'Reservation not found' }, { status: 404 })
    }

    const artistId = (reservation as any).artworks?.artist_id
    const isBuyer = reservation.buyer_id === user.id
    const isArtist = artistId === user.id

    if (!isBuyer && !isArtist) {
      return NextResponse.json({ error: 'Not your reservation' }, { status: 403 })
    }

    const paidStatuses = ['reservation_paid', 'scheduling_in_progress', 'ready_for_pickup', 'handoff_completed']
    if (!paidStatuses.includes(reservation.status)) {
      return NextResponse.json({ error: 'Payment required' }, { status: 403 })
    }

    if (action === 'propose') {
      const when = new Date(meetingAt)
      if (isNaN(when.getTime())) {
        return NextResponse.json({ error: 'Invalid date' }, { status: 400 })
      }
      if (when.getTime() < Date.now()) {
        return NextResponse.json({ error: 'That time is in the past' }, { status: 400 })
      }

      // A new proposal always clears any previous confirmation.
      await admin
        .from('reservations')
        .update({
          meeting_at: when.toISOString(),
          meeting_proposed_by: user.id,
          meeting_confirmed_at: null,
          status: 'scheduling_in_progress',
        })
        .eq('id', reservationId)

      await notifyMeeting(reservationId, user.id, 'propose')
      return NextResponse.json({ ok: true })
    }

    if (action === 'confirm') {
      if (!reservation.meeting_at) {
        return NextResponse.json({ error: 'No time has been proposed yet' }, { status: 400 })
      }
      // You cannot confirm your own proposal — that would defeat the point.
      if (reservation.meeting_proposed_by === user.id) {
        return NextResponse.json({ error: 'The other person needs to confirm' }, { status: 403 })
      }

      await admin
        .from('reservations')
        .update({
          meeting_confirmed_at: new Date().toISOString(),
          status: 'ready_for_pickup',
        })
        .eq('id', reservationId)

      await notifyMeeting(reservationId, user.id, 'confirm')
      return NextResponse.json({ ok: true })
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}