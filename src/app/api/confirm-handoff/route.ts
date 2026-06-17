import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { reservationId } = await request.json()
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    // Load the reservation and confirm this user is the buyer
    const { data: reservation } = await supabase
      .from('reservations')
      .select('id, buyer_id, artwork_id')
      .eq('id', reservationId)
      .single()

    if (!reservation) return NextResponse.json({ error: 'Reservation not found' }, { status: 404 })
    if (reservation.buyer_id !== user.id) return NextResponse.json({ error: 'Not authorized' }, { status: 403 })

    const admin = createAdminClient()
    await admin.from('reservations').update({ status: 'handoff_completed' }).eq('id', reservationId)
    await admin.from('artworks').update({ status: 'sold' }).eq('id', reservation.artwork_id)

    return NextResponse.json({ ok: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}