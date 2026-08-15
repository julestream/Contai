import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const roleParam = searchParams.get('role') // 'artist' or 'buyer', only present on sign-up

  // Behind Vercel's proxy, `origin` can resolve to an internal hostname.
  // Redirecting there would set the session cookie on a host the browser
  // never visits, so prefer the configured public URL.
  const forwardedHost = request.headers.get('x-forwarded-host')
  const forwardedProto = request.headers.get('x-forwarded-proto') ?? 'https'
  const base =
    process.env.NEXT_PUBLIC_APP_URL ||
    (forwardedHost ? `${forwardedProto}://${forwardedHost}` : origin)

  if (!code) {
    return NextResponse.redirect(`${base}/signin?error=nocode`)
  }

  const supabase = createClient()
  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
  if (exchangeError) {
    console.error('[auth/callback] exchange failed:', exchangeError.message)
    return NextResponse.redirect(`${base}/signin?error=exchange`)
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    console.error('[auth/callback] no user after exchange')
    return NextResponse.redirect(`${base}/signin?error=nouser`)
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  // Brand-new OAuth user: no profile yet. Create one.
  if (!profile) {
    const newRole = roleParam === 'artist' ? 'artist' : 'buyer'
    const { error: insertError } = await supabase.from('profiles').insert({
      id: user.id,
      role: newRole,
    })
    if (insertError) {
      console.error('[auth/callback] profile insert failed:', insertError.message)
      return NextResponse.redirect(`${base}/signin?error=profile`)
    }
    if (newRole === 'artist') {
      return NextResponse.redirect(`${base}/dashboard/onboarding`)
    }
    return NextResponse.redirect(`${base}/welcome`)
  }

  // Existing user: route by their stored role
  if (profile.role === 'admin') {
    return NextResponse.redirect(`${base}/admin`)
  }
  if (profile.role === 'artist') {
    return NextResponse.redirect(`${base}/dashboard`)
  }
  return NextResponse.redirect(`${base}/home`)
}