import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const roleParam = searchParams.get('role') // 'artist' or 'buyer', only present on sign-up

  if (code) {
    const supabase = createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()

        // Brand-new OAuth user: no profile yet. Create one.
        if (!profile) {
          const newRole = roleParam === 'artist' ? 'artist' : 'buyer'
          await supabase.from('profiles').insert({
            id: user.id,
            role: newRole,
          })
          if (newRole === 'artist') {
            return NextResponse.redirect(`${origin}/dashboard/onboarding`)
          }
          return NextResponse.redirect(`${origin}/welcome`)
        }

        // Existing user: route by their stored role
        if (profile.role === 'admin') {
          return NextResponse.redirect(`${origin}/admin`)
        }
        if (profile.role === 'artist') {
          return NextResponse.redirect(`${origin}/dashboard`)
        }
        return NextResponse.redirect(`${origin}/home`)
      }
    }
  }

  return NextResponse.redirect(`${origin}/signin?error=auth`)
}