import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function AdminHomePage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/signin')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/')

  const { count: pendingListings } = await supabase
    .from('artworks')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'under_review')

  const { count: pendingDocs } = await supabase
    .from('verification_documents')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'pending')

  const { count: openIssues } = await supabase
    .from('reservations')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'buyer_issue_reported')

  const cards = [
    { href: '/admin/listings', label: 'Review listings', desc: 'Approve or reject artworks', count: pendingListings || 0 },
    { href: '/admin/documents', label: 'Verification documents', desc: 'Review artist IDs & certificates', count: pendingDocs || 0 },
    { href: '/admin/issues', label: 'Issues', desc: 'Reported problems with handoffs', count: openIssues || 0 },
  ]

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '28px', marginBottom: '0.5rem' }}>Admin</h1>
      <p style={{ color: '#999', marginBottom: '2rem' }}>Contai · The Art Market</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {cards.map(card => (
          <Link key={card.href} href={card.href} style={{ textDecoration: 'none' }}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '1.5rem', border: '1px solid #e8e8e8', borderRadius: '12px',
              backgroundColor: 'white',
            }}>
              <div>
                <p style={{ fontFamily: 'Georgia, serif', fontSize: '18px', color: '#0a0a0a' }}>{card.label}</p>
                <p style={{ color: '#999', fontSize: '14px', marginTop: '4px' }}>{card.desc}</p>
              </div>
              {card.count > 0 && (
                <span style={{
                  minWidth: '28px', height: '28px', padding: '0 8px', borderRadius: '999px',
                  backgroundColor: '#0a0a0a', color: 'white', fontSize: '14px', fontWeight: 600,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {card.count}
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
