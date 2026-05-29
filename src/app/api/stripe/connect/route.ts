import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import Stripe from 'stripe'
import { NextResponse } from 'next/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-04-22.dahlia',
})

export async function POST(request: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const adminSupabase = createAdminClient()

  // Create Stripe Connect Express account
  const account = await stripe.accounts.create({
    type: 'express',
    country: 'HU',
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
  })

  // Save account ID to profile
  await adminSupabase
    .from('profiles')
    .update({ stripe_account_id: account.id })
    .eq('id', user.id)

  // Create account link
  const accountLink = await stripe.accountLinks.create({
    account: account.id,
    refresh_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
    type: 'account_onboarding',
  })

  return NextResponse.json({ url: accountLink.url })
}
