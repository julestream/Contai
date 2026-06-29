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
  const [googleLoading, setGoogleLoading] = useState(false)
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
        router.push('/home')
      }
    }
    setLoading(false)
  }

  async function handleGoogle() {
    setGoogleLoading(true)
    setError('')
    const supabase = createClient()
    const { error: googleError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (googleError) {
      setError('Could not sign in with Google. Please try again.')
      setGoogleLoading(false)
    }
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

      {/* Divider */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '1.5rem 0' }}>
        <div style={{ flex: 1, height: '1px', background: '#e0dcd3' }} />
        <span style={{ color: '#8a857c', fontSize: '13px' }}>or</span>
        <div style={{ flex: 1, height: '1px', background: '#e0dcd3' }} />
      </div>

      {/* Continue with Google */}
      <button
        onClick={handleGoogle}
        disabled={googleLoading}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          padding: '14px',
          borderRadius: '999px',
          border: '1px solid #e0dcd3',
          background: '#ffffff',
          color: '#0a0a0a',
          fontSize: '16px',
          fontWeight: 600,
          cursor: 'pointer',
          fontFamily: 'var(--font-instrument), sans-serif',
          opacity: googleLoading ? 0.6 : 1,
        }}
      >
        <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
          <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
          <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
          <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
          <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
        </svg>
        {googleLoading ? 'Connecting…' : 'Continue with Google'}
      </button>

      <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '14px' }}>
        <Link href="/forgot-password" style={{ color: '#8a857c', textDecoration: 'none' }}>Forgot password?</Link>
      </p>
      <p style={{ textAlign: 'center', marginTop: '0.75rem', color: '#8a857c', fontSize: '14px' }}>
        No account? <Link href="/signup" style={{ color: '#0a0a0a', fontWeight: 600, textDecoration: 'none' }}>Sign up</Link>
      </p>
    </div>
  )
}