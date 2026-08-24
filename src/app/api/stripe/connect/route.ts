import { createAdminClient } from '@/lib/supabase/admin'
import { notifyArtistOfReservation, notifyBuyerOfReservation } from '@/lib/notify'
import Stripe from 'stripe'
import { NextResponse } from 'next/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-04-22.dahlia',
})

function generateHandoffCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const part1 = Array.from({ length: 3 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
  const part2 = Array.from({ length: 3 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
  return `${part1}·${part2}`
}

export async function POST(request: Request) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }

  const adminSupabase = createAdminClient()

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const { reservationId, artworkId } = session.metadata!

    const handoffCode = generateHandoffCode()
    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString()

    await adminSupabase
      .from('reservations')
      .update({
        status: 'reservation_paid',
        stripe_payment_intent_id: session.payment_intent as string,
        handoff_code: handoffCode,
        reservation_expires_at: expiresAt,
      })
      .eq('id', reservationId)

    await adminSupabase
      .from('artworks')
      .update({ status: 'reserved' })
      .eq('id', artworkId)

    // Tell the artist. Failures are logged, never thrown — a broken email
    // must not stop Stripe's webhook from succeeding, or it will retry forever.
    await notifyArtistOfReservation(reservationId)

    // And tell the buyer, who has just paid and otherwise hears nothing.
    await notifyBuyerOfReservation(reservationId)
  }

  if (event.type === 'checkout.session.expired') {
    const session = event.data.object as Stripe.Checkout.Session
    const { reservationId, artworkId } = session.metadata!

    await adminSupabase
      .from('reservations')
      .update({ status: 'reservation_expired' })
      .eq('id', reservationId)

    // Only return it to Browse if it is still marked reserved. If the artist
    // has hidden or removed it since, leave their decision alone.
    await adminSupabase
      .from('artworks')
      .update({ status: 'live' })
      .eq('id', artworkId)
      .eq('status', 'reserved')
  }

  return NextResponse.json({ received: true })
}