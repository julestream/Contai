'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Logo from '@/components/ui/Logo'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function UpdatePasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  async function handleUpdate() {
    setError('')
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return }
    if (password !== confirm) { setError('Passwords do not match.'); return }
    setLoading(true)
    const supabase = createClient()
    const { error: updateError } = await supabase.auth.updateUser({ password })
    if (updateError) { setError(updateError.message); setLoading(false); return }
    setLoading(false)
    setDone(true)
    setTimeout(() => router.push('/signin'), 2000)
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

      <h1 style={{ fontSize: '26px', marginBottom: '4px', textAlign: 'center' }}>New password</h1>
      <p style={{ textAlign: 'center', color: '#8a857c', fontSize: '14px', marginBottom: '2rem' }}>
        Choose a new password for your account.
      </p>

      {done ? (
        <div style={{ padding: '16px', background: '#eef4f1', borderRadius: '12px', color: '#2d6a4f', fontSize: '14px', textAlign: 'center', lineHeight: 1.6 }}>
          Password updated. Taking you to sign in…
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <input
              type="password"
              placeholder="New password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={inputStyle}
            />
            <input
              type="password"
              placeholder="Confirm new password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              style={inputStyle}
            />
            {error && <p style={{ color: '#b94040', fontSize: '14px' }}>{error}</p>}
            <button
              onClick={handleUpdate}
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
              {loading ? 'Updating…' : 'Update password'}
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