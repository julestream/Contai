import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Only ever follow a path on this site — never a full URL or //evil.com.
function safeNext(value: string | null): string | null {
  if (!value) return null
  if (!value.startsWith('/')) return null
  if (value.startsWith('//')) return null
  return value
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const roleParam = searchParams.get('role') // 'artist' or 'buyer', only present on sign-up
  // Where the person was headed before they were asked to sign in.
  const next = safeNext(searchParams.get('next'))

  // Behind Vercel's proxy, `origin` can resolve to an internal hostname.
  const forwardedHost = request.headers.get('x-forwarded-host')
  const forwardedProto = request.headers.get('x-forwarded-proto') ?? 'https'
  const base =
    process.env.NEXT_PUBLIC_APP_URL ||
    (forwardedHost ? `${forwardedProto}://${forwardedHost}` : origin)

  const pendingCookies: { name: string; value: string; options: any }[] = []

  function go(path: string) {
    const response = NextResponse.redirect(`${base}${path}`)
    // Attach the session cookies to the response we are actually sending.
    // Writing them through next/headers does not survive a hand-built redirect.
    pendingCookies.forEach(({ name, value, options }) =>
      response.cookies.set(name, value, options)
    )
    return response
  }

  if (!code) {
    return go('/signin?error=nocode')
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          pendingCookies.push(...cookiesToSet)
        },
      },
    }
  )

  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
  if (exchangeError) {
    console.error('[auth/callback] exchange failed:', exchangeError.message)
    return go('/signin?error=exchange')
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    console.error('[auth/callback] no user after exchange')
    return go('/signin?error=nouser')
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
      return go('/signin?error=profile')
    }
    // An artist still goes to onboarding — they cannot list without it.
    // A new buyer who was mid-purchase goes back to the artwork instead
    // of to the welcome screen; they can pick their tastes later.
    if (newRole === 'artist') return go('/dashboard/onboarding')
    return go(next || '/welcome')
  }

  // A destination carried through sign-in wins over the usual landing page,
  // except for admins, who should always land in the admin area.
  if (profile.role === 'admin') return go('/admin')
  if (next) return go(next)
  if (profile.role === 'artist') return go('/dashboard')
  return go('/home')
}