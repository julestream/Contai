'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getOrCreateConversation } from '@/lib/getOrCreateConversation'
import { useRouter } from 'next/navigation'
import { useLang } from '@/i18n/LanguageProvider'

export default function MessageArtistButton({ artworkId, artistId }: { artworkId: string, artistId: string }) {
  const { t } = useLang()
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleMessage() {
    setLoading(true)

    // Same as the offer button: without a session this did nothing visible.
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      router.push(`/signin?next=${encodeURIComponent(`/artwork/${artworkId}`)}`)
      return
    }

    const convId = await getOrCreateConversation(artworkId, artistId)
    if (convId) {
      router.push(`/messages/${convId}`)
      return
    }
    setLoading(false)
  }

  return (
    <button
      onClick={handleMessage}
      disabled={loading}
      style={{
        width: '100%',
        marginTop: '12px',
        padding: '16px',
        backgroundColor: 'white',
        color: '#0a0a0a',
        border: '1px solid #0a0a0a',
        borderRadius: '999px',
        textAlign: 'center',
        fontSize: '16px',
        fontWeight: 500,
        cursor: 'pointer',
      }}
    >
      {loading ? t('artwork.opening') : t('artwork.messageArtist')}
    </button>
  )
}