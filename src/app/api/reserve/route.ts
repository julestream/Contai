import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import Stripe from 'stripe'
import { NextResponse } from 'next/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-04-22.dahlia',
})

export async function POST(request: Request) {
  try {
    const { artworkId, offerId, deliveryChoice } = await request.json()
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Fetch artwork
    const { data: artwork } = await supabase
      .from('artworks')
      .select('*')
      .eq('id', artworkId)
      .eq('status', 'live')
      .single()

    if (!artwork) {
      return NextResponse.json({ error: 'Artwork not available' }, { status: 400 })
    }

    if (artwork.artist_id === user.id) {
      return NextResponse.json({ error: 'You cannot reserve your own artwork' }, { status: 400 })
    }

    // Determine price + fee — use accepted offer if provided and valid
    let agreedPrice = artwork.price_huf
    let fee = artwork.reservation_fee_huf
    if (offerId) {
      const { data: offer } = await supabase
        .from('offers')
        .select('*')
        .eq('id', offerId)
        .eq('buyer_id', user.id)
        .eq('artwork_id', artworkId)
        .eq('status', 'accepted')
        .single()
      if (offer) {
        agreedPrice = offer.amount_huf
        fee = Math.max(500, Math.round(offer.amount_huf * 0.08))
      }
    }

    const adminSupabase = createAdminClient()

    // Create reservation
    const { data: reservation } = await adminSupabase
      .from('reservations')
      .insert({
        artwork_id: artworkId,
        buyer_id: user.id,
        status: 'reserved',
        reservation_fee_huf: fee,
        agreed_price_huf: agreedPrice,
        delivery_choice: deliveryChoice === 'delivery' ? 'delivery' : 'pickup',
      })
      .select('id')
      .single()

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'huf',
          product_data: {
            name: `Reservation fee — ${artwork.title}`,
            description: 'This fee is deducted from the total price when you meet the artist.',
          },
          unit_amount: Math.round(fee * 100),
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/handoff/${reservation!.id}?success=1`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/artwork/${artworkId}`,
      metadata: {
        reservationId: reservation!.id,
        artworkId,
      },
    })

    await adminSupabase
      .from('reservations')
      .update({ stripe_checkout_session_id: session.id })
      .eq('id', reservation!.id)

    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}