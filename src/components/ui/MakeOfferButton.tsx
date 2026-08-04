'use client'
import { useState } from 'react'
import { getOrCreateConversation } from '@/lib/getOrCreateConversation'
import { useRouter } from 'next/navigation'
import { useLang } from '@/i18n/LanguageProvider'

export default function MakeOfferButton({ artworkId, artistId }: { artworkId: string, artistId: string }) {
  const { t } = useLang()
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleOffer() {
    setLoading(true)
    const convId = await getOrCreateConversation(artworkId, artistId)
    if (convId) {
      router.push(`/messages/${convId}?makeOffer=1`)
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