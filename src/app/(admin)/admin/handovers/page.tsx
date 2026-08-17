import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

const STATUS_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  reserved: { bg: '#fef3c7', color: '#92400e', label: 'Awaiting payment' },
  reservation_paid: { bg: '#e8eef4', color: '#2b4a6f', label: 'Paid — needs a time' },
  scheduling_in_progress: { bg: '#f3efe6', color: '#8a6d1e', label: 'Time proposed' },
  ready_for_pickup: { bg: '#eef4f1', color: '#2d6a4f', label: 'Confirmed' },
  handoff_completed: { bg: '#f5f3ef', color: '#666', label: 'Completed' },
  reservation_expired: { bg: '#ece9e3', color: '#8a857c', label: 'Expired' },
  buyer_issue_reported: { bg: '#fdf0f0', color: '#b94040', label: 'Issue reported' },
  refunded: { bg: '#ece9e3', color: '#8a857c', label: 'Refunded' },
}

function money(amount: number | null | undefined, currency: string | null | undefined) {
  if (amount == null) return '—'
  const n = Math.round(amount).toLocaleString()
  if (currency === 'EUR') return `€${n}`
  if (currency === 'RON') return `${n} lei`
  return `${n} Ft`
}

function when(iso: string | null | undefined) {
  if (!iso) return null
  return new Date(iso).toLocaleString('en-GB', {
    weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
  })
}

function shortDate(iso: string | null | undefined) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default async function HandoversPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/signin')

  const { data: me } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (me?.role !== 'admin') redirect('/home')

  // Service-role client: admins have no RLS read policy on reservations,
  // and this page is already gated on the role check above.
  const admin = createAdminClient()

  const { data: reservations } = await admin
    .from('reservations')
    .select('*, artworks(title, images, artist_id)')
    .order('created_at', { ascending: false })

  const rows = reservations || []

  // Resolve names in one go rather than guessing foreign-key constraint names.
  const ids = new Set<string>()
  rows.forEach((r: any) => {
    if (r.buyer_id) ids.add(r.buyer_id)
    if (r.artworks?.artist_id) ids.add(r.artworks.artist_id)
  })

  let nameById: Record<string, string> = {}
  if (ids.size > 0) {
    const { data: people } = await admin
      .from('profiles')
      .select('id, full_name')
      .in('id', Array.from(ids))
    nameById = Object.fromEntries((people || []).map((p: any) => [p.id, p.full_name || '—']))
  }

  const needsAction = rows.filter((r: any) =>
    ['reservation_paid', 'scheduling_in_progress'].includes(r.status)
  ).length
  const upcoming = rows.filter((r: any) => r.status === 'ready_for_pickup').length
  const completed = rows.filter((r: any) => r.status === 'handoff_completed').length
  const issues = rows.filter((r: any) => r.status === 'buyer_issue_reported').length

  const cellLabel: React.CSSProperties = { fontSize: '11px', color: '#999', textTransform: 'uppercase', letterSpacing: '0.06em' }

  return (
    <div style={{ maxWidth: '860px', margin: '0 auto', padding: '1.5rem 1rem 5rem' }}>
      <h1 style={{ fontFamily: 'var(--font-fraunces), Georgia, serif', fontSize: '26px', marginBottom: '4px' }}>
        Handovers
      </h1>
      <p style={{ fontSize: '13px', color: '#999', marginBottom: '1.5rem' }}>
        Every reservation, newest first. {rows.length} total.
      </p>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '2rem' }}>
        {[
          { label: 'Needs a time', value: needsAction },
          { label: 'Confirmed', value: upcoming },
          { label: 'Completed', value: completed },
          { label: 'Issues', value: issues },
        ].map(s => (
          <div key={s.label} style={{ padding: '14px', border: '1px solid #e8e8e8', borderRadius: '10px', textAlign: 'center' }}>
            <p style={{ fontFamily: 'var(--font-fraunces), Georgia, serif', fontSize: '24px' }}>{s.value}</p>
            <p style={{ fontSize: '11px', color: '#666', marginTop: '2px', lineHeight: 1.2 }}>{s.label}</p>
          </div>
        ))}
      </div>

      {rows.length === 0 && (
        <p style={{ padding: '3rem', textAlign: 'center', color: '#999' }}>No reservations yet.</p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {rows.map((r: any) => {
          const artwork = r.artworks
          const img = (artwork?.images as string[])?.[0]
          const style = STATUS_STYLE[r.status] || { bg: '#f5f3ef', color: '#666', label: r.status }
          const meetingConfirmed = !!r.meeting_confirmed_at
          const meetingTime = when(r.meeting_at)

          return (
            <div key={r.id} style={{ border: '1px solid #e8e8e8', borderRadius: '12px', padding: '14px' }}>
              <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                {img ? (
                  <img src={img} style={{ width: '64px', height: '64px', objectFit: 'cover', borderRadius: '8px', flexShrink: 0 }} />
                ) : (
                  <div style={{ width: '64px', height: '64px', background: '#f5f3ef', borderRadius: '8px', flexShrink: 0 }} />
                )}

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'flex-start' }}>
                    <p style={{ fontWeight: 600, fontSize: '15px' }}>{artwork?.title || 'Artwork'}</p>
                    <span style={{
                      padding: '4px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: 600,
                      background: style.bg, color: style.color, whiteSpace: 'nowrap', flexShrink: 0,
                    }}>
                      {style.label}
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px', marginTop: '12px' }}>
                    <div>
                      <p style={cellLabel}>Artist</p>
                      <p style={{ fontSize: '14px' }}>{nameById[artwork?.artist_id] || '—'}</p>
                    </div>
                    <div>
                      <p style={cellLabel}>Collector</p>
                      <p style={{ fontSize: '14px' }}>{nameById[r.buyer_id] || '—'}</p>
                    </div>
                    <div>
                      <p style={cellLabel}>Agreed price</p>
                      <p style={{ fontSize: '14px' }}>{money(r.agreed_price ?? r.agreed_price_huf, r.currency)}</p>
                    </div>
                    <div>
                      <p style={cellLabel}>Fee paid</p>
                      <p style={{ fontSize: '14px' }}>{money(r.reservation_fee ?? r.reservation_fee_huf, r.currency)}</p>
                    </div>
                    <div>
                      <p style={cellLabel}>Meeting</p>
                      <p style={{ fontSize: '14px', color: meetingConfirmed ? '#2d6a4f' : '#8a6d1e' }}>
                        {meetingTime
                          ? `${meetingTime}${meetingConfirmed ? '' : ' (unconfirmed)'}`
                          : 'Not set'}
                      </p>
                    </div>
                    <div>
                      <p style={cellLabel}>Code</p>
                      <p style={{ fontSize: '14px', fontFamily: 'monospace', letterSpacing: '0.04em' }}>
                        {r.handoff_code || '—'}
                      </p>
                    </div>
                    <div>
                      <p style={cellLabel}>Reserved</p>
                      <p style={{ fontSize: '14px' }}>{shortDate(r.created_at)}</p>
                    </div>
                    <div>
                      <p style={cellLabel}>Delivery</p>
                      <p style={{ fontSize: '14px', textTransform: 'capitalize' }}>{r.delivery_choice || 'pickup'}</p>
                    </div>
                  </div>

                  <Link href={`/handoff/${r.id}`} style={{ fontSize: '13px', color: '#0a0a0a', textDecoration: 'underline', display: 'inline-block', marginTop: '12px' }}>
                    Open handoff page
                  </Link>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}