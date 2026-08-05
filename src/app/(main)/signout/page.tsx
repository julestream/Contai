'use client'
import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useLang } from '@/i18n/LanguageProvider'

export default function SignOutPage() {
  const router = useRouter()
  const { t } = useLang()

  useEffect(() => {
    async function signOut() {
      const supabase = createClient()
      await supabase.auth.signOut()
      router.push('/signin')
    }
    signOut()
  }, [router])

  return <div style={{ padding: '2rem' }}>{t('common.signingOut')}</div>
}