'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getOrCreateConversation } from '@/lib/getOrCreateConversation'
import { useRouter } from 'next/navigation'
import { useLang } from '@/i18n/LanguageProvider'

export default function MakeOfferButton({ artworkId, artistId }: { artworkId: string, artistId: string }) {
  const { t } = useLang()
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleOffer() {
    setLoading(true)

    // A signed-out visitor used to get nothing at all here: the server
    // action returns null without a session, and the button silently did
    // nothing. Silence reads as a broken site, so send them to sign in and
    // bring them back to this artwork afterwards.
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      router.push(`/signin?next=${encodeURIComponent(`/artwork/${artworkId}`)}`)
      return
    }

    const convId = await getOrCreateConversation(artworkId, artistId)
    if (convId) {
      router.push(`/messages/${convId}?makeOffer=1`)
      return
    }
    setLoading(false)
  }

  return (
    <button
      onClick={handleOffer}
      disabled={loading}
      style={{
        width: '100%', marginTop: '10px', padding: '14px',
        backgroundColor: 'white', color: '#0a0a0a',
        border: '1px solid #0a0a0a', borderRadius: '999px',
        textAlign: 'center', fontSize: '15px', fontWeight: 500, cursor: 'pointer',
      }}
    >
      {loading ? t('artwork.opening') : t('artwork.makeOffer')}
    </button>
  )
}