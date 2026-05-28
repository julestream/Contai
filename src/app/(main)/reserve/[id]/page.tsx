import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ReserveClient from './ReserveClient'

export default async function ReservePage({ params }: { params: { id: string } }) {
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

  return <ReserveClient artwork={artwork} />
}
