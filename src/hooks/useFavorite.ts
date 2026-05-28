'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useFavorite(artworkId: string) {
  const [isFavorited, setIsFavorited] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function checkFavorite() {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const { data } = await supabase
        .from('favorites')
        .select('id')
        .eq('profile_id', session.user.id)
        .eq('artwork_id', artworkId)
        .single()

      setIsFavorited(!!data)
    }
    checkFavorite()
  }, [artworkId])

  async function toggleFavorite() {
    setLoading(true)
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { setLoading(false); return }

    if (isFavorited) {
      await supabase.from('favorites')
        .delete()
        .eq('profile_id', session.user.id)
        .eq('artwork_id', artworkId)
      setIsFavorited(false)
    } else {
      await supabase.from('favorites')
        .insert({ profile_id: session.user.id, artwork_id: artworkId })
      setIsFavorited(true)
    }
    setLoading(false)
  }

  return { isFavorited, toggleFavorite, loading }
}
