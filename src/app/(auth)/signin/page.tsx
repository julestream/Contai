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

  return (
    <div style={{ padding: '2rem', maxWidth: '430px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <Logo />
      </div>
      <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '24px', marginBottom: '1.5rem' }}>Sign in</h1>

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
        <Button onClick={handleSignIn} loading={loading} full>Sign in</Button>
      </div>

      <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '14px' }}>
        <Link href="/forgot-password" style={{ color: '#666' }}>Forgot password?</Link>
      </p>
      <p style={{ textAlign: 'center', marginTop: '1rem', color: '#666', fontSize: '14px' }}>
        No account? <Link href="/signup" style={{ color: '#0a0a0a', fontWeight: 600 }}>Sign up</Link>
      </p>
    </div>
  )
}
