'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight, HelpCircle } from 'lucide-react'
import LanguageSwitcher from '@/components/ui/LanguageSwitcher'
import CurrencySwitcher from '@/components/ui/CurrencySwitcher'
import { useLang } from '@/i18n/LanguageProvider'

export default function MePage() {
  const router = useRouter()
  const { t } = useLang()
  const m = (k: string) => t(`me.${k}`)
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
  const roleMap = (t('me.roleLabels') || {}) as Record<string, string>
  const roleLabel = (role && roleMap[role]) || role || ''

  const sectionLabel: React.CSSProperties = { fontSize: '12px', letterSpacing: '0.08em', color: '#999', textTransform: 'uppercase', margin: '24px 0 4px' }

  function Row({ label, href, soon }: { label: string; href?: string; soon?: boolean }) {
    const inner = (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0', borderBottom: '1px solid #eee' }}>
        <span style={{ fontSize: '16px', color: soon ? '#bbb' : '#0a0a0a' }}>{label}</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          {soon && <span style={{ fontSize: '11px', color: '#bbb' }}>{m('comingSoon')}</span>}
          <ChevronRight size={18} color="#ccc" />
        </span>
      </div>
    )
    if (href && !soon) return <Link href={href} style={{ textDecoration: 'none' }}>{inner}</Link>
    return inner
  }

  if (loading) {
    return <div style={{ padding: '2rem', maxWidth: '430px', margin: '0 auto' }}>{m('loading')}</div>
  }

  return (
    <div style={{ maxWidth: '430px', margin: '0 auto', paddingBottom: '6rem' }}>
      {/* Page title */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
        <h1 style={{ fontFamily: 'var(--font-fraunces), Georgia, serif', fontSize: '18px', fontWeight: 700 }}>{m('title')}</h1>
      </div>

      <div style={{ padding: '0 1rem' }}>
        {/* Profile header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '8px 0 16px' }}>
          <Link href={role === 'artist' || role === 'admin' ? '/dashboard/profile' : '/me/personal-info'} aria-label={m('editProfile')}
            style={{ width: '64px', height: '64px', borderRadius: '999px', backgroundColor: '#f5f3ef', flexShrink: 0, overflow: 'hidden', display: 'block', position: 'relative' }}>
            {profile?.avatar_url
              ? <img src={profile.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#bbb', fontSize: '11px' }}>{m('edit')}</span>}
          </Link>
          <div>
            <p style={{ fontFamily: 'var(--font-fraunces), Georgia, serif', fontSize: '24px', color: '#0a0a0a' }}>{profile?.full_name || m('yourName')}</p>
            <p style={{ fontSize: '14px', color: '#999' }}>{roleLabel}{profile?.city ? ` · ${profile.city}` : ''}</p>
          </div>
        </div>

        {/* Buying */}
        <p style={sectionLabel}>{m('buying')}</p>
        <Row label={m('orders')} href="/me/orders" />
        <Row label={m('savedSearches')} href="/me/saved-searches" />
        <Row label={m('favorites')} href="/favorites" />
        <Row label={m('paymentMethods')} soon />

        {/* Selling — available to everyone */}
        <p style={sectionLabel}>{m('selling')}</p>
        <Row label={m('myListings')} href="/dashboard" />
        <Row label={m('sales')} href="/me/sales" />
        <Row label={m('getPaid')} href="/me/get-paid" />

        {/* Vacation mode toggle */}
        <div style={{ padding: '16px 0', borderBottom: '1px solid #eee' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '16px', color: '#0a0a0a' }}>
              {m('vacationMode')}
              <button onClick={() => setShowVacInfo(v => !v)} aria-label={m('vacationHelp')}
                style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', color: '#bbb' }}>
                <HelpCircle size={15} />
              </button>
            </span>
            <button onClick={toggleVacation} disabled={savingVac} aria-label={m('vacationToggle')}
              style={{
                width: '46px', height: '26px', borderRadius: '999px', border: 'none', cursor: 'pointer',
                background: vacation ? '#0a0a0a' : '#d8d4cc', position: 'relative', transition: 'background 0.2s',
                flexShrink: 0,
              }}>
              <span style={{
                position: 'absolute', top: '3px', left: vacation ? '23px' : '3px',
                width: '20px', height: '20px', borderRadius: '999px', background: '#fff', transition: 'left 0.2s',
              }} />
            </button>
          </div>
          {showVacInfo && (
            <p style={{ fontSize: '13px', color: '#777', marginTop: '10px', lineHeight: 1.5 }}>
              {m('vacationInfo')}
            </p>
          )}
        </div>

        <Row label={m('verification')} href="/dashboard/verification" />

        {/* Account */}
        <p style={sectionLabel}>{m('accountInfo')}</p>
        <Row label={m('personalInfo')} href="/me/personal-info" />
        <Row label={m('notifications')} href="/notifications" />
        <Row label={m('badges')} href="/me/badges" />

        {/* Legal */}
        <p style={sectionLabel}>{m('legal')}</p>
        <Row label={m('privacy')} href="/privacy" />
        <Row label={m('terms')} href="/terms" />

        {/* Help */}
        <p style={sectionLabel}>{m('helpSupport')}</p>
        <Row label={m('helpCentre')} href="/me/help" />
        <Row label={m('contactUs')} href="/me/contact" />

        {/* Language */}
        <p style={sectionLabel}>{m('language')}</p>
        <div style={{ padding: '12px 0' }}>
          <LanguageSwitcher />
        </div>

        {/* Currency */}
        <p style={sectionLabel}>{m('currency')}</p>
        <div style={{ padding: '12px 0' }}>
          <CurrencySwitcher />
        </div>

        {/* Sign out */}
        <button onClick={handleSignOut} style={{
          width: '100%', marginTop: '28px', padding: '16px', borderRadius: '999px',
          border: '1px solid #0a0a0a', background: '#0a0a0a', color: '#f5f3ef',
          fontSize: '16px', fontWeight: 600, cursor: 'pointer',
        }}>
          {m('signOut')}
        </button>

        <p style={{ textAlign: 'center', color: '#ccc', fontSize: '12px', marginTop: '20px' }}>{m('tagline')}</p>
      </div>
    </div>
  )
}