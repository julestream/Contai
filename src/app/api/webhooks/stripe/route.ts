import { createAdminClient } from '@/lib/supabase/admin'
import Stripe from 'stripe'
import { NextResponse } from 'next/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
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
  }

  if (event.type === 'checkout.session.expired') {
    const session = event.data.object as Stripe.Checkout.Session
    const { reservationId, artworkId } = session.metadata!

    await adminSupabase
      .from('reservations')
      .update({ status: 'reservation_expired' })
      .eq('id', reservationId)

    await adminSupabase
      .from('artworks')
      .update({ status: 'live' })
      .eq('id', artworkId)
  }

  return NextResponse.json({ received: true })
}
