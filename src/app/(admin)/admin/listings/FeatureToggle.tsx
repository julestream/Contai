'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function FeatureToggle({ artworkId, isFeatured }: { artworkId: string; isFeatured: boolean }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function toggle() {
    setLoading(true)
    const supabase = createClient()
    await supabase.from('artworks').update({ featured: !isFeatured }).eq('id', artworkId)
    router.refresh()
    setLoading(false)
  }

  return (
    <button onClick={toggle} disabled={loading} style={{
      padding: '8px 14px', borderRadius: '999px', fontSize: '13px', cursor: 'pointer', fontWeight: 500,
      border: isFeatured ? '2px solid #c8a24a' : '1px solid #e0dcd3',
      background: isFeatured ? '#c8a24a' : '#fff',
      color: isFeatured ? '#fff' : '#0a0a0a',
    }}>
      {loading ? '...' : isFeatured ? '★ Featured' : '☆ Feature'}
    </button>
  )
}