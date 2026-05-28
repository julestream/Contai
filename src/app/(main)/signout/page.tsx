'use client'
import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function SignOutPage() {
  const router = useRouter()
  
  useEffect(() => {
    async function signOut() {
      const supabase = createClient()
      await supabase.auth.signOut()
      router.push('/signin')
    }
    signOut()
  }, [router])

  return <div style={{ padding: '2rem' }}>Signing out...</div>
}
