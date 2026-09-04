import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import StatusActions from '../listings/StatusActions'

export const dynamic = 'force-dynamic'

const STATUSES = [
  { value: '', label: 'All' },
  { value: 'live', label: 'Live' },
  { value: 'under_review', label: 'Under review' },
  { value: 'hidden', label: 'Hidden' },
  { value: 'reserved', label: 'Reserved' },
  { value: 'sold', label: 'Sold' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'removed', label: 'Archived' },
]

const STATUS_COLOUR: Record<string, { bg: string; fg: string }> = {
  live: { bg: '#eef4f1', fg: '#2d6a4f' },
  under_review: { bg: '#fef3c7', fg: '#92400e' },
  hidden: { bg: '#f0f0ef', fg: '#6b6b66' },
  reserved: { bg: '#f3efe6', fg: '#8a6d3b' },
  sold: { bg: '#eceff5', fg: '#3d5181' },
  rejected: { bg: '#fdf0f0', fg: '#b94040' },
  removed: { bg: '#f0f0ef', fg: '#9a9a95' },
}

export default async function AllListingsPage({
  searchParams,
}: {
  searchParams: { status?: string }
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/signin')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  if (profile?.role !== 'admin') redirect('/')

  const status = searchParams.status ?? 'live'

  let query = supabase
    .from('artworks')
    .select('*, profiles(id, full_name)')
    .order('created_at', { ascending: false })

  if (status) query = query.eq('status', status)

  const { data: artworks } = await query

  function money(a: any) {
    // The artist's own currency is authoritative — price_huf is only an
    // approximation for filtering, and showing it here would misrepresent
    // what a lei-priced artist actually asked for.
    const amount = a.price_amount ?? a.price_huf
    if (amount == null) return '—'
    const n = Math.round(amount).toLocaleString()
    const cur = a.price_currency || 'HUF'
    if (cur === 'EUR') return `€${n}`
    if (cur === 'RON') return `${n} lei`
    return `${n} Ft`
  }

  return (
    <div style={{ padding: '2rem 1.5rem', maxWidth: '900px', margin: '0 auto' }}>
      <h1 style={{ fontFamily: 'var(--font-fraunces), Georgia, serif', fontSize: '28px', marginBottom: '4px' }}>
        All listings
      </h1>
      <p style={{ color: '#8a857c', fontSize: '14px', marginBottom: '1.5rem' }}>
        Everything on Contai, including work already approved. Star a piece to
        put it in Curatorial picks on the home page.
      </p>

      {/* Status filter */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '1.75rem' }}>
        {STATUSES.map(s => {
          const active = status === s.value
          return (
            <Link
              key={s.value || 'all'}
              href={s.value ? `/admin/all-listings?status=${s.value}` : '/admin/all-listings?status='}
              style={{
                padding: '7px 14px', borderRadius: '999px', fontSize: '13px',
                textDecoration: 'none',
                border: active ? '1.5px solid #0a0a0a' : '1px solid #e0dcd3',
                background: active ? '#0a0a0a' : '#fff',
                color: active ? '#fff' : '#0a0a0a',
              }}
            >
              {s.label}
            </Link>
          )
        })}
      </div>

      <p style={{ color: '#8a857c', fontSize: '13px', marginBottom: '1rem' }}>
        {artworks?.length || 0} {artworks?.length === 1 ? 'work' : 'works'}
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {artworks?.map(a => {
          const account = (a as any).profiles?.full_name || 'Unknown account'
          const credited = a.artist_name || null
          const colour = STATUS_COLOUR[a.status] || { bg: '#f0f0ef', fg: '#6b6b66' }
          const img = (a.images as string[])?.[0]

          return (
            <div key={a.id} style={{
              border: a.featured ? '1px solid #e4d9c2' : '1px solid #e8e8e8',
              borderRadius: '12px',
              padding: '1rem', background: a.featured ? '#fdfbf7' : '#fff',
              display: 'flex', gap: '14px', alignItems: 'flex-start',
            }}>
              <div style={{
                width: '84px', height: '84px', borderRadius: '8px',
                background: '#f2f2f0', flexShrink: 0, overflow: 'hidden',
              }}>
                {img && <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', flexWrap: 'wrap' }}>
                  <h2 style={{ fontFamily: 'var(--font-fraunces), Georgia, serif', fontSize: '17px' }}>
                    {a.title}
                  </h2>
                  <span style={{
                    padding: '2px 9px', borderRadius: '999px', fontSize: '11.5px',
                    fontWeight: 600, background: colour.bg, color: colour.fg,
                  }}>
                    {a.status}
                  </span>
                  {a.featured && (
                    <span style={{
                      padding: '2px 9px', borderRadius: '999px', fontSize: '11.5px',
                      fontWeight: 600, background: '#f3efe6', color: '#8a6d3b',
                    }}>
                      ★ pick
                    </span>
                  )}
                </div>

                {/* Credited artist and uploading account are different things.
                    Showing only one hides work listed on someone else's
                    behalf — which is easy to act on by mistake. */}
                <p style={{ fontSize: '13.5px', color: '#333', marginTop: '3px' }}>
                  {credited ? <>Credited: <strong>{credited}</strong></> : <>Credited: {account}</>}
                </p>
                <p style={{ fontSize: '12.5px', color: '#8a857c', marginTop: '1px' }}>
                  Uploaded by {account}
                  {credited && credited !== account && ' — listed on another artist\'s behalf'}
                </p>

                <p style={{ fontSize: '12.5px', color: '#8a857c', marginTop: '6px' }}>
                  {money(a)}
                  {a.type_of_art ? ` · ${a.type_of_art}` : ''}
                  {a.medium ? ` · ${a.medium}` : ''}
                  {a.city ? ` · ${a.city}` : ''}
                </p>
                <p style={{ fontSize: '12px', color: '#a8a39a', marginTop: '2px' }}>
                  Added {new Date(a.created_at).toLocaleDateString('en-GB')}
                </p>

                <div style={{ display: 'flex', gap: '12px', marginTop: '8px', flexWrap: 'wrap' }}>
                  <Link href={`/artwork/${a.id}`} style={{ fontSize: '13px', color: '#0a0a0a' }}>
                    View
                  </Link>
                  <Link href={`/dashboard/edit/${a.id}`} style={{ fontSize: '13px', color: '#0a0a0a' }}>
                    Edit
                  </Link>
                </div>

                <StatusActions artworkId={a.id} status={a.status} featured={a.featured} />
              </div>
            </div>
          )
        })}
      </div>

      {artworks?.length === 0 && (
        <p style={{ color: '#999', padding: '2rem 0' }}>Nothing with this status.</p>
      )}
    </div>
  )
}