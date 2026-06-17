import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Not authorized' }, { status: 403 })

  const { path } = await request.json()
  if (!path) return NextResponse.json({ error: 'No path provided' }, { status: 400 })

  const admin = createAdminClient()
  const { data, error } = await admin.storage.from('verification-docs').createSignedUrl(path, 60)
  if (error || !data) return NextResponse.json({ error: 'Could not create URL' }, { status: 500 })

  return NextResponse.json({ url: data.signedUrl })
}