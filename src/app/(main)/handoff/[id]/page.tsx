import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import HandoffClient from './HandoffClient'

export const dynamic = 'force-dynamic'

export default async function HandoffPage({
  params,
  searchParams,
}: {
  params: { id: string }
  searchParams: { success?: string }
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/signin')

  // No buyer_id filter — the artist needs this page too, now that they are
  // half of the scheduling. Row-level security already limits it to the two
  // people involved.
  const { data: reservation } = await supabase
    .from('reservations')
    .select('*, artworks(id, title, images, price_amount, price_currency, price_huf, reservation_fee_amount, reservation_fee_huf, pickup_area, artist_id, profiles(full_name, city))')
    .eq('id', params.id)
    .single()

  if (!reservation) redirect('/browse')

  const artistId = (reservation as any).artworks?.artist_id
  const isBuyer = reservation.buyer_id === user.id
  const isArtist = artistId === user.id

  if (!isBuyer && !isArtist) redirect('/browse')

  return (
    <HandoffClient
      reservation={reservation}
      userId={user.id}
      isBuyer={isBuyer}
      isArtist={isArtist}
      justPaid={searchParams.success === '1'}
    />
  )
}