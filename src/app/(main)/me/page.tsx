'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight, Bell, HelpCircle } from 'lucide-react'
import LanguageSwitcher from '@/components/ui/LanguageSwitcher'

export default function MePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [vacation, setVacation] = useState(false)
  const [savingVac, setSavingVac] = useState(false)
  const [showVacInfo, setShowVacInfo] = useState(false)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/signin'); return }
      const { data } = await supabase
        .from('profiles')
        .select('full_name, role, avatar_url, city, vacation_mode')
        .eq('id', session.user.id)
        .single()
      setProfile(data)
      setVacation(!!data?.vacation_mode)
      setLoading(false)
    }
    load()
  }, [router])

  async function toggleVacation() {
    const next = !vacation
    setVacation(next)
    setSavingVac(true)
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (session) {
      await supabase.from('profiles').update({ vacation_mode: next }).eq('id', session.user.id)
    }
    setSavingVac(false)
  }

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
        <h1 style={{ fontFamily: 'var(--font-fraunces), Georgia, serif', fontSize: '18px', fontWeight: 700 }}>Me</h1>
        <span style={{ width: 22 }} />
      </div>

      <div style={{ padding: '0 1rem' }}>
        {/* Profile header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '8px 0 16px' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '999px', backgroundColor: '#f5f3ef', flexShrink: 0, overflow: 'hidden' }}>
            {profile?.avatar_url && <img src={profile.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
          </div>
          <div>
            <p style={{ fontFamily: 'var(--font-fraunces), Georgia, serif', fontSize: '24px' }}>{profile?.full_name || 'Your name'}</p>
            <p style={{ fontSize: '14px', color: '#999', textTransform: 'capitalize' }}>{role}{profile?.city ? ` · ${profile.city}` : ''}</p>
          </div>
        </div>

        {/* Buying */}
        <p style={sectionLabel}>Buying</p>
        <Row label="Orders" href="/me/orders" />
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

            {/* Vacation mode toggle */}
            <div style={{ padding: '16px 0', borderBottom: '1px solid #eee' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '16px', color: '#0a0a0a' }}>
                  Vacation mode
                  <button onClick={() => setShowVacInfo(v => !v)} aria-label="What is vacation mode?"
                    style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', color: '#bbb' }}>
                    <HelpCircle size={15} />
                  </button>
                </span>
                <button onClick={toggleVacation} disabled={savingVac} aria-label="Toggle vacation mode"
                  style={{
                    width: '46px', height: '26px', borderRadius: '999px', border: 'none', cursor: 'pointer',
                    background: vacation ? '#0a0a0a' : '#d8d4cc', position: 'relative', transition: 'background 0.2s',
                  }}>
                  <span style={{
                    position: 'absolute', top: '3px', left: vacation ? '23px' : '3px',
                    width: '20px', height: '20px', borderRadius: '999px', background: '#fff', transition: 'left 0.2s',
                  }} />
                </button>
              </div>
              {showVacInfo && (
                <p style={{ fontSize: '13px', color: '#777', marginTop: '10px', lineHeight: 1.5 }}>
                  When vacation mode is on, your artworks stay visible and people can still favourite them, but buyers can't reserve or purchase until you turn it off. Use it when you're away and can't meet buyers.
                </p>
              )}
            </div>

            <Row label="Verification" href="/dashboard/verification" />
          </>
        )}

        {/* Account */}
        <p style={sectionLabel}>Account info</p>
        <Row label="Personal info" href="/me/personal-info" />
        <Row label="Notifications" href="/notifications" />
        <Row label="Badges" href="/me/badges" />

        {/* Legal */}
        <p style={sectionLabel}>Legal</p>
        <Row label="Privacy Policy" href="/privacy" />
        <Row label="Terms of Service" href="/terms" />

        {/* Help */}
        <p style={sectionLabel}>Help & support</p>
        <Row label="Help centre" href="/me/help" />
        <Row label="Contact us" href="/me/contact" />

        {/* Language */}
        <p style={sectionLabel}>Language</p>
        <div style={{ padding: '12px 0' }}>
          <LanguageSwitcher />
        </div>

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