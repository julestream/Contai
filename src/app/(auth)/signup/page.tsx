'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Logo from '@/components/ui/Logo'
import Button from '@/components/ui/Button'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function SignUpPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'buyer' | 'artist'>('buyer')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  async function handleSignUp() {
    setLoading(true)
    setError('')
    const supabase = createClient()

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    if (data.user) {
      // Insert profile
      await supabase.from('profiles').insert({
        id: data.user.id,
        role,
      })

      // Sign in immediately
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        setError(signInError.message)
        setLoading(false)
        return
      }

      if (role === 'artist') {
        router.push('/dashboard/onboarding')
      } else {
        router.push('/welcome')
      }
    }
    setLoading(false)
  }

  async function handleGoogle() {
    setGoogleLoading(true)
    setError('')
    const supabase = createClient()
    // Pass the chosen role to the callback so a new Google user
    // gets the correct profile (buyer or artist).
    const { error: googleError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?role=${role}`,
      },
    })
    if (googleError) {
      setError('Could not sign up with Google. Please try again.')
      setGoogleLoading(false)
    }
    // On success the browser redirects to Google.
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '430px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <Logo />
      </div>
      <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '24px', marginBottom: '1.5rem' }}>Create account</h1>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '1.5rem' }}>
        {(['buyer', 'artist'] as const).map(r => (
          <button
            key={r}
            onClick={() => setRole(r)}
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: '8px',
              border: role === r ? '2px solid #0a0a0a' : '1px solid #e8e8e8',
              background: role === r ? '#0a0a0a' : 'white',
              color: role === r ? 'white' : '#0a0a0a',
              cursor: 'pointer',
              fontWeight: role === r ? 600 : 400,
              textTransform: 'capitalize',
            }}
          >{r}</button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          style={{ padding: '12px', borderRadius: '8px', border: '1px solid #e8e8e8', fontSize: '16px', outline: 'none' }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          style={{ padding: '12px', borderRadius: '8px', border: '1px solid #e8e8e8', fontSize: '16px', outline: 'none' }}
        />
        {error && <p style={{ color: '#b94040', fontSize: '14px' }}>{error}</p>}
        <Button onClick={handleSignUp} loading={loading} full>Create account</Button>
      </div>

      {/* Divider */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '1.5rem 0' }}>
        <div style={{ flex: 1, height: '1px', background: '#e8e8e8' }} />
        <span style={{ color: '#999', fontSize: '13px' }}>or</span>
        <div style={{ flex: 1, height: '1px', background: '#e8e8e8' }} />
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
          width: '100%',
          padding: '14px',
          borderRadius: '999px',
          border: '1px solid #e8e8e8',
          background: '#ffffff',
          color: '#0a0a0a',
          fontSize: '16px',
          fontWeight: 600,
          cursor: 'pointer',
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

      <p style={{ textAlign: 'center', marginTop: '1.5rem', color: '#666', fontSize: '14px' }}>
        Already have an account? <Link href="/signin" style={{ color: '#0a0a0a', fontWeight: 600 }}>Sign in</Link>
      </p>
    </div>
  )
}