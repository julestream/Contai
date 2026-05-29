import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: { reservationId: string } }
) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const { data: reservation } = await supabase
    .from('reservations')
    .select('*')
    .eq('id', params.reservationId)
    .eq('buyer_id', user.id)
    .single()

  if (!reservation) {
    return NextResponse.json({ error: 'Reservation not found' }, { status: 404 })
  }

  const allowedStatuses = ['reservation_paid', 'scheduling_in_progress', 'ready_for_pickup', 'handoff_completed']
  if (!allowedStatuses.includes(reservation.status)) {
    return NextResponse.json({ error: 'Payment required' }, { status: 403 })
  }

  const adminSupabase = createAdminClient()
  const { data: artwork } = await adminSupabase
    .from('artworks')
    .select('pickup_address, pickup_method')
    .eq('id', reservation.artwork_id)
    .single()

  return NextResponse.json({
    address: artwork?.pickup_address,
    method: artwork?.pickup_method,
  })
}
