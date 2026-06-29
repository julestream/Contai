'use server'
import { createClient } from '@/lib/supabase/server'

export async function getOrCreateConversation(artworkId: string, artistId: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: existing } = await supabase
    .from('conversations')
    .select('id')
    .eq('artwork_id', artworkId)
    .eq('buyer_id', user.id)
    .eq('artist_id', artistId)
    .maybeSingle()

  if (existing) return existing.id

  const { data: newConv, error: insErr } = await supabase
    .from('conversations')
    .insert({ artwork_id: artworkId, buyer_id: user.id, artist_id: artistId })
    .select('id')
    .single()

  if (insErr) { console.error('Conversation create failed:', insErr.message); return null }
  return newConv?.id
}