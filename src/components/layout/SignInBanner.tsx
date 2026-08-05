import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { getDict, DEFAULT_LANG, Lang } from '@/i18n/dictionaries'

export default async function SignInBanner() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Logged in → show nothing
  if (user) return null

  const lang = (cookies().get('contai_lang')?.value as Lang) || DEFAULT_LANG
  const nav = (getDict(lang) as any).nav

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      gap: 12, padding: '12px 16px', margin: '12px 16px',
      background: '#f5f3ef', borderRadius: 12,
    }}>
      <span style={{ fontSize: 14, color: '#0a0a0a' }}>
        {nav.signInPrompt}
      </span>
      <Link href="/signin" style={{
        flexShrink: 0, padding: '8px 16px', borderRadius: 999,
        background: '#0a0a0a', color: '#fff', fontSize: 14, fontWeight: 600,
        textDecoration: 'none', whiteSpace: 'nowrap',
      }}>
        {nav.signIn}
      </Link>
    </div>
  )
}