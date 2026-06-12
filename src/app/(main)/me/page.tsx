'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight, Bell } from 'lucide-react'

export default function MePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/signin'); return }
      const { data } = await supabase
        .from('profiles')
        .select('full_name, role, avatar_url, city')
        .eq('id', session.user.id)
        .single()
      setProfile(data)
      setLoading(false)
    }
    load()
  }, [router])

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/signin')
  }

  const role = profile?.role
  const isArtist = role === 'artist' || role === 'admin'

  const sectionLabel: React.CSSProperties = { fontSize: '12px', letterSpacing: '0.08em', color: '#999', textTransform: 'uppercase', margin: '24px 0 4px' }

  function Row({ label, href, soon }: { label: string; href?: string; soon?: boolean }) {
    const inner = (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0', borderBottom: '1px solid #eee' }}>
        <span style={{ fontSize: '16px', color: soon ? '#bbb' : '#0a0a0a' }}>{label}</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {soon && <span style={{ fontSize: '11px', color: '#bbb' }}>coming soon</span>}
          <ChevronRight size={18} color="#ccc" />
        </span>
      </div>
    )
    if (href && !soon) return <Link href={href} style={{ textDecoration: 'none' }}>{inner}</Link>
    return inner
  }

  if (loading) {
    return <div style={{ padding: '2rem', maxWidth: '430px', margin: '0 auto' }}>Loading…</div>
  }

  return (
    <div style={{ maxWidth: '430px', margin: '0 auto', paddingBottom: '6rem' }}>
      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem' }}>
        <Link href="/notifications" aria-label="Notifications" style={{ color: '#0a0a0a' }}>
          <Bell size={22} />
        </Link>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '18px', fontWeight: 700 }}>Me</h1>
        <span style={{ width: 22 }} />
      </div>

      <div style={{ padding: '0 1rem' }}>
        {/* Profile header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '8px 0 16px' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '999px', backgroundColor: '#f5f3ef', flexShrink: 0, overflow: 'hidden' }}>
            {profile?.avatar_url && <img src={profile.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
          </div>
          <div>
            <p style={{ fontFamily: 'Georgia, serif', fontSize: '24px' }}>{profile?.full_name || 'Your name'}</p>
            <p style={{ fontSize: '14px', color: '#999', textTransform: 'capitalize' }}>{role}{profile?.city ? ` · ${profile.city}` : ''}</p>
          </div>
        </div>

        {/* Buying */}
        <p style={sectionLabel}>Buying</p>
        <Row label="Orders" soon />
        <Row label="Saved searches" soon />
        <Row label="Favorites" href="/favorites" />
        <Row label="Payment methods" soon />

        {/* Selling (artists only) */}
        {isArtist && (
          <>
            <p style={sectionLabel}>Selling</p>
            <Row label="My listings" href="/dashboard" />
            <Row label="Sales" soon />
            <Row label="Get paid" soon />
            <Row label="Vacation mode" soon />
            <Row label="Verification" href="/dashboard/verification" />
          </>
        )}

        {/* Account */}
        <p style={sectionLabel}>Account info</p>
        <Row label="Personal info" soon />
        <Row label="Notifications" href="/notifications" />
        <Row label="Badges" soon />
        <Row label="Privacy" soon />

        {/* Help */}
        <p style={sectionLabel}>Help & support</p>
        <Row label="Help centre" soon />
        <Row label="Chat with us" soon />

        {/* Sign out */}
        <button onClick={handleSignOut} style={{
          width: '100%', marginTop: '28px', padding: '16px', borderRadius: '999px',
          border: '1px solid #0a0a0a', background: '#0a0a0a', color: '#f5f3ef',
          fontSize: '16px', fontWeight: 600, cursor: 'pointer',
        }}>
          Sign out
        </button>

        <p style={{ textAlign: 'center', color: '#ccc', fontSize: '12px', marginTop: '20px' }}>Contai · The Art Market</p>
      </div>
    </div>
  )
}
