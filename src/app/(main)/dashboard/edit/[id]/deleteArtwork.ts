'use server'
import { createClient } from '@/lib/supabase/server'

export async function deleteArtwork(artworkId: string): Promise<{ ok: boolean; archived?: boolean; error?: string }> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'Not signed in.' }

  // Confirm ownership
  const { data: art } = await supabase
    .from('artworks')
    .select('id, artist_id')
    .eq('id', artworkId)
    .maybeSingle()
  if (!art) return { ok: false, error: 'Artwork not found.' }
  if (art.artist_id !== user.id) return { ok: false, error: 'You can only delete your own artwork.' }

  // Check for related activity that we must not orphan
  const { count: offerCount } = await supabase
    .from('offers')
    .select('id', { count: 'exact', head: true })
    .eq('artwork_id', artworkId)

  const { count: reservationCount } = await supabase
    .from('reservations')
    .select('id', { count: 'exact', head: true })
    .eq('artwork_id', artworkId)

  const hasActivity = (offerCount || 0) > 0 || (reservationCount || 0) > 0

  if (hasActivity) {
    // Safe path: archive instead of hard-delete, to preserve payment/legal records
    const { error: archErr } = await supabase
      .from('artworks')
      .update({ status: 'removed' })
      .eq('id', artworkId)
    if (archErr) return { ok: false, error: archErr.message }
    return { ok: true, archived: true }
  }

  // Clean piece — truly delete from the database
  const { error: delErr } = await supabase
    .from('artworks')
    .delete()
    .eq('id', artworkId)
  if (delErr) return { ok: false, error: delErr.message }
  return { ok: true, archived: false }
}