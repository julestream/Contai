'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Logo from '@/components/ui/Logo'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)

  async function handleReset() {
    setError('')
    if (!email.trim()) { setError('Please enter your email.'); return }
    setLoading(true)
    const supabase = createClient()
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/update-password`,
    })
    if (resetError) { setError(resetError.message); setLoading(false); return }
    setLoading(false)
    setSent(true)
  }

  const inputStyle: React.CSSProperties = {
    padding: '14px 16px',
    borderRadius: '10px',
    border: '1px solid #e0dcd3',
    background: '#ffffff',
    fontSize: '16px',
    outline: 'none',
    fontFamily: 'var(--font-instrument), sans-serif',
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      maxWidth: '430px',
      margin: '0 auto',
      padding: '2rem 1.5rem',
    }}>
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <Logo size={0.9} />
      </div>

      <h1 style={{ fontSize: '26px', marginBottom: '4px', textAlign: 'center' }}>Reset password</h1>
      <p style={{ textAlign: 'center', color: '#8a857c', fontSize: '14px', marginBottom: '2rem' }}>
        Enter your email and we'll send you a reset link.
      </p>

      {sent ? (
        <div style={{ textAlign: 'center' }}>
          <div style={{ padding: '16px', background: '#eef4f1', borderRadius: '12px', color: '#2d6a4f', fontSize: '14px', lineHeight: 1.6 }}>
            If an account exists for <strong>{email}</strong>, a reset link is on its way. Check your inbox (and spam folder).
          </div>
          <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '14px' }}>
            <Link href="/signin" style={{ color: '#0a0a0a', fontWeight: 600, textDecoration: 'none' }}>Back to sign in</Link>
          </p>
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={inputStyle}
            />
            {error && <p style={{ color: '#b94040', fontSize: '14px' }}>{error}</p>}
            <button
              onClick={handleReset}
              disabled={loading}
              style={{
                marginTop: '4px',
                padding: '15px',
                borderRadius: '999px',
                border: 'none',
                background: '#0a0a0a',
                color: '#f5f3ef',
                fontSize: '16px',
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'var(--font-instrument), sans-serif',
                opacity: loading ? 0.6 : 1,
              }}
            >
              {loading ? 'Sending…' : 'Send reset link'}
            </button>
          </div>

          <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '14px' }}>
            <Link href="/signin" style={{ color: '#8a857c', textDecoration: 'none' }}>Back to sign in</Link>
          </p>
        </>
      )}
    </div>
  )
}