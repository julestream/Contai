'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Logo from '@/components/ui/Logo'
import Button from '@/components/ui/Button'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function SignInPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  async function handleSignIn() {
    setLoading(true)
    setError('')
    const supabase = createClient()

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError) {
      setError('Invalid email or password')
      setLoading(false)
      return
    }

    if (data.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single()

      if (profile?.role === 'admin') {
        router.push('/admin')
      } else if (profile?.role === 'artist') {
        router.push('/dashboard')
      } else {
        router.push('/browse')
      }
    }
    setLoading(false)
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

      <h1 style={{ fontSize: '26px', marginBottom: '4px', textAlign: 'center' }}>Welcome back</h1>
      <p style={{ textAlign: 'center', color: '#8a857c', fontSize: '14px', marginBottom: '2rem' }}>
        Sign in to your account
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          style={inputStyle}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          style={inputStyle}
        />
        {error && <p style={{ color: '#b94040', fontSize: '14px' }}>{error}</p>}
        <button
          onClick={handleSignIn}
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
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </div>

      <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '14px' }}>
        <Link href="/forgot-password" style={{ color: '#8a857c', textDecoration: 'none' }}>Forgot password?</Link>
      </p>
      <p style={{ textAlign: 'center', marginTop: '0.75rem', color: '#8a857c', fontSize: '14px' }}>
        No account? <Link href="/signup" style={{ color: '#0a0a0a', fontWeight: 600, textDecoration: 'none' }}>Sign up</Link>
      </p>
    </div>
  )
}