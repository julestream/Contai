import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import BadgeToggle from './BadgeToggle'

export default async function AdminArtistsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/signin')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  if (profile?.role !== 'admin') redirect('/')

  const admin = createAdminClient()
  const { data: artists } = await admin
    .from('profiles')
    .select('id, full_name, city, role, avatar_url')
    .in('role', ['artist', 'admin'])
    .order('full_name', { ascending: true })

  const { data: allBadges } = await admin
    .from('badges')
    .select('profile_id, badge_type')

  // Emails live in auth.users, which the normal client cannot read.
  // Only ever rendered here, on an admin-gated page.
  const emailById: Record<string, string> = {}
  const { data: authUsers } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 })
  for (const u of authUsers?.users || []) {
    if (u.email) emailById[u.id] = u.email
  }

  const badgesByArtist: Record<string, string[]> = {}
  for (const b of allBadges || []) {
    if (!badgesByArtist[b.profile_id]) badgesByArtist[b.profile_id] = []
    badgesByArtist[b.profile_id].push(b.badge_type)
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ fontFamily: 'var(--font-fraunces), Georgia, serif', fontSize: '28px', marginBottom: '2rem' }}>
        Artists ({artists?.length || 0})
      </h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {artists?.map(artist => {
          const badges = badgesByArtist[artist.id] || []
          const email = emailById[artist.id]
          return (
            <div key={artist.id} style={{ padding: '1.25rem', border: '1px solid #e8e8e8', borderRadius: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                <Link href={`/artist/${artist.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '999px', backgroundColor: '#f5f3ef', overflow: 'hidden', flexShrink: 0 }}>
                    {artist.avatar_url && <img src={artist.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontWeight: 600, fontSize: '16px', textDecoration: 'underline' }}>{artist.full_name || 'Unnamed artist'}</p>
                    {/* The only way to tell who a nameless artist is. */}
                    <p style={{ color: '#666', fontSize: '13px', marginTop: '3px', wordBreak: 'break-all' }}>
                      {email || 'No email on file'}
                    </p>
                    <p style={{ color: '#999', fontSize: '13px', marginTop: '2px' }}>{artist.city || 'No city'}</p>
                    <p style={{ fontSize: '12px', color: '#bbb', marginTop: '4px' }}>
                      {badges.includes('verified_artist') ? 'Verified (ID approved)' : 'Not yet verified'}
                    </p>
                  </div>
                </Link>
                <BadgeToggle
                  profileId={artist.id}
                  hasEstablished={badges.includes('established_artist')}
                  hasCurator={badges.includes('curator_approved')}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}