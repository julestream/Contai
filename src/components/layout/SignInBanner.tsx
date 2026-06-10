import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function SignInBanner() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Logged in → show nothing
  if (user) return null

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      gap: 12, padding: '12px 16px', margin: '12px 16px',
      background: '#f5f3ef', borderRadius: 12,
    }}>
      <span style={{ fontSize: 14, color: '#0a0a0a' }}>
        Sign in to reserve art and message artists
      </span>
      <Link href="/signin" style={{
        flexShrink: 0, padding: '8px 16px', borderRadius: 999,
        background: '#0a0a0a', color: '#fff', fontSize: 14, fontWeight: 600,
        textDecoration: 'none',
      }}>
        Sign in
      </Link>
    </div>
  )
}
