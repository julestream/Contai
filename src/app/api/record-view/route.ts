import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ ok: false, reason: 'not_authenticated' })
  }

  let artworkId: string | undefined
  try {
    const body = await request.json()
    artworkId = body.artworkId
  } catch {
    return NextResponse.json({ ok: false, reason: 'bad_body' }, { status: 400 })
  }

  if (!artworkId) {
    return NextResponse.json({ ok: false, reason: 'missing_artwork' }, { status: 400 })
  }

  const { error } = await supabase
    .from('recently_viewed')
    .upsert(
      { user_id: user.id, artwork_id: artworkId, viewed_at: new Date().toISOString() },
      { onConflict: 'user_id,artwork_id' }
    )

  if (error) {
    return NextResponse.json({ ok: false, reason: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}