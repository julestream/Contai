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

      <p style={{ textAlign: 'center', marginTop: '1.5rem', color: '#666', fontSize: '14px' }}>
        Already have an account? <Link href="/signin" style={{ color: '#0a0a0a', fontWeight: 600 }}>Sign in</Link>
      </p>
    </div>
  )
}
