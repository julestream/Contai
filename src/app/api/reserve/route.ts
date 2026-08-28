import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { reservationFee, normaliseCurrency } from '@/lib/fees'
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

    // The artist's currency governs the whole transaction.
    let currency = normaliseCurrency(artwork.price_currency)
    let agreedPrice = artwork.price_amount ?? artwork.price_huf
    let fee = artwork.reservation_fee_amount ?? reservationFee(agreedPrice, currency)

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
        currency = normaliseCurrency(offer.currency ?? artwork.price_currency)
        agreedPrice = offer.amount ?? offer.amount_huf
        fee = reservationFee(agreedPrice, currency)
      }
    }

    if (!fee || fee <= 0) {
      return NextResponse.json({ error: 'Could not determine the reservation fee' }, { status: 400 })
    }

    const adminSupabase = createAdminClient()
    const isHuf = currency === 'HUF'

    // Create reservation
    const { data: reservation } = await adminSupabase
      .from('reservations')
      .insert({
        artwork_id: artworkId,
        buyer_id: user.id,
        status: 'reserved',
        // Authoritative
        currency,
        agreed_price: agreedPrice,
        reservation_fee: fee,
        // Legacy columns — only meaningful when the deal is in forints
        reservation_fee_huf: isHuf ? fee : null,
        agreed_price_huf: isHuf ? Math.round(agreedPrice) : null,
        delivery_choice: deliveryChoice === 'delivery' ? 'delivery' : 'pickup',
      })
      .select('id')
      .single()

    // Create Stripe checkout session
    // No payment_method_types specified — Stripe shows all methods
    // enabled in the Dashboard that are eligible for the currency/country
    // (cards, Apple Pay, Google Pay, Link, Amazon Pay where supported).
    const session = await stripe.checkout.sessions.create({
      line_items: [{
        price_data: {
          currency: currency.toLowerCase(),
          product_data: {
            name: `Reservation fee — ${artwork.title}`,
            // The receipt is where a buyer looks when they need an invoice,
            // so it has to say who is invoicing what.
            description: 'Reservation fee, invoiced by CONTAIT KFT. Deducted from the total price; the balance is paid directly to the artist, who invoices it separately.',
          },
          // HUF, EUR and RON are all two-decimal in Stripe's API.
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