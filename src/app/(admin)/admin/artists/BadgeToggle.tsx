'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function BadgeToggle({ profileId, hasEstablished, hasCurator }: { profileId: string; hasEstablished: boolean; hasCurator: boolean }) {
  const router = useRouter()
  const [loading, setLoading] = useState('')

  async function toggle(badgeType: string, currentlyHas: boolean) {
    setLoading(badgeType)
    const supabase = createClient()
    if (currentlyHas) {
      await supabase.from('badges').delete().eq('profile_id', profileId).eq('badge_type', badgeType)
    } else {
      await supabase.from('badges').insert({ profile_id: profileId, badge_type: badgeType })
    }
    router.refresh()
    setLoading('')
  }

  const btn = (active: boolean): React.CSSProperties => ({
    padding: '8px 14px', borderRadius: '999px', fontSize: '13px', cursor: 'pointer', fontWeight: 500,
    border: active ? '2px solid #0a0a0a' : '1px solid #e0dcd3',
    background: active ? '#0a0a0a' : '#fff', color: active ? '#fff' : '#0a0a0a',
  })

  return (
    <div style={{ display: 'flex', gap: '8px' }}>
      <button onClick={() => toggle('established_artist', hasEstablished)} disabled={!!loading} style={btn(hasEstablished)}>
        {loading === 'established_artist' ? '...' : hasEstablished ? 'Established (on)' : 'Established'}
      </button>
      <button onClick={() => toggle('curator_approved', hasCurator)} disabled={!!loading} style={btn(hasCurator)}>
        {loading === 'curator_approved' ? '...' : hasCurator ? 'Curator (on)' : 'Curator'}
      </button>
    </div>
  )
}