import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import HandoffClient from './HandoffClient'

export default async function HandoffPage({ params, searchParams }: { params: { id: string }, searchParams: { success?: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/signin')

  const { data: reservation } = await supabase
    .from('reservations')
    .select('*, artworks(id, title, images, price_huf, reservation_fee_huf, pickup_area, artist_id, profiles(full_name, city))')
    .eq('id', params.id)
    .eq('buyer_id', user.id)
    .single()

  if (!reservation) redirect('/browse')

  return <HandoffClient reservation={reservation} userId={user.id} />
}
