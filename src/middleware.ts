import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const SUPPORTED = ['hu', 'en', 'ro'] as const
const LANG_COOKIE = 'contai_lang'

/**
 * Picks a language from the browser's Accept-Language header.
 *
 * The header looks like: ro-RO,ro;q=0.9,en-US;q=0.8,en;q=0.7
 * Each entry carries a quality weight, so we sort by it and take the first
 * one we actually support. Returns null when nothing matches, and the
 * caller falls back to Hungarian.
 */
function detectLanguage(header: string | null): string | null {
  if (!header) return null

  const ranked = header
    .split(',')
    .map(part => {
      const [tag, ...params] = part.trim().split(';')
      const qParam = params.find(p => p.trim().startsWith('q='))
      const q = qParam ? parseFloat(qParam.split('=')[1]) : 1
      // 'ro-RO' and 'ro' both mean Romanian to us.
      return { code: tag.trim().toLowerCase().split('-')[0], q: isNaN(q) ? 0 : q }
    })
    .filter(x => x.code)
    .sort((a, b) => b.q - a.q)

  for (const entry of ranked) {
    if ((SUPPORTED as readonly string[]).includes(entry.code)) return entry.code
  }
  return null
}

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Do not remove or move this line, and do not add code between the client
  // above and this call. It refreshes the auth cookie on every request —
  // without it the browser holds a session the server cannot see.
  await supabase.auth.getUser()

  // First visit only: guess a language from the browser.
  //
  // Once the cookie exists this never runs again, so an explicit choice in
  // the switcher always wins — even on a phone set to another language.
  // A Romanian visitor arriving from Instagram should not have to navigate
  // a Hungarian interface to find the way out of it.
  if (!request.cookies.get(LANG_COOKIE)) {
    const detected = detectLanguage(request.headers.get('accept-language'))
    if (detected) {
      supabaseResponse.cookies.set(LANG_COOKIE, detected, {
        path: '/',
        maxAge: 60 * 60 * 24 * 365,
        sameSite: 'lax',
      })
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    // Everything except static assets and image files
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}