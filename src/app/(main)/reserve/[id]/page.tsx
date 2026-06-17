import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ReserveClient from './ReserveClient'

export default async function ReservePage({ params, searchParams }: { params: { id: string }, searchParams: { offer?: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/signin')

  const { data: artwork } = await supabase
    .from('artworks')
    .select('*, profiles(full_name)')
    .eq('id', params.id)
    .eq('status', 'live')
    .single()

  if (!artwork) redirect('/browse')

  // If arriving from an accepted offer, load and validate it
  let agreedOffer: any = null
  if (searchParams.offer) {
    const { data: offer } = await supabase
      .from('offers')
      .select('*')
      .eq('id', searchParams.offer)
      .eq('buyer_id', user.id)
      .eq('status', 'accepted')
      .single()
    if (offer && offer.artwork_id === artwork.id) {
      agreedOffer = offer
    }
  }

  return <ReserveClient artwork={artwork} agreedOffer={agreedOffer} />
}