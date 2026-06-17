import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { reservationId, issueType, issueNotes } = await request.json()
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    if (!reservationId || !issueType) {
      return NextResponse.json({ error: 'Missing details' }, { status: 400 })
    }

    const admin = createAdminClient()
    const { error } = await admin.from('issues').insert({
      reservation_id: reservationId,
      reported_by: user.id,
      issue_type: issueType,
      notes: issueNotes || null,
      status: 'open',
    })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}