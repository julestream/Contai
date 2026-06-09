import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import ApproveRejectButtons from './ApproveRejectButtons'

export default async function AdminListingsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/signin')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/')

  const { data: artworks } = await supabase
    .from('artworks')
    .select('*, profiles(full_name)')
    .eq('status', 'under_review')
    .order('created_at', { ascending: true })

  // Look up ID-verification status for each artist (admin client bypasses RLS)
  const admin = createAdminClient()
  const artistIds = Array.from(new Set((artworks || []).map(a => a.artist_id)))
  let idDocsByArtist: Record<string, string> = {}
  if (artistIds.length > 0) {
    const { data: docs } = await admin
      .from('verification_documents')
      .select('profile_id, status')
      .eq('document_type', 'id')
      .in('profile_id', artistIds)
    for (const d of docs || []) {
      // prefer 'approved' over 'pending' if multiple
      if (d.status === 'approved' || !idDocsByArtist[d.profile_id]) {
        idDocsByArtist[d.profile_id] = d.status
      }
    }
  }

  function idBadge(artistId: string) {
    const status = idDocsByArtist[artistId]
    if (status === 'approved') return { label: 'ID approved', color: '#2d6a4f', bg: '#eef4f1' }
    if (status === 'pending') return { label: 'ID uploaded (pending)', color: '#92400e', bg: '#fef3c7' }
    return { label: 'No ID on file', color: '#b94040', bg: '#fdf0f0' }
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '28px', marginBottom: '2rem' }}>
        Review Listings ({artworks?.length || 0})
      </h1>

      {artworks?.length === 0 && (
        <p style={{ color: '#999' }}>No artworks pending review.</p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {artworks?.map(artwork => {
          const badge = idBadge(artwork.artist_id)
          return (
          <div key={artwork.id} style={{
            border: '1px solid #e8e8e8',
            borderRadius: '12px',
            padding: '1.5rem',
            backgroundColor: 'white',
          }}>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
              {(artwork.images as string[])?.map((url, i) => (
                <img key={i} src={url} style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px' }} />
              ))}
            </div>

            <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '20px' }}>{artwork.title}</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px', flexWrap: 'wrap' }}>
              <p style={{ color: '#666' }}>by {(artwork as any).profiles?.full_name || 'Unknown artist'}</p>
              <span style={{ padding: '3px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: 600, backgroundColor: badge.bg, color: badge.color }}>
                {badge.label}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '1rem', fontSize: '14px' }}>
              <p><strong>Medium:</strong> {artwork.medium}</p>
              <p><strong>Year:</strong> {artwork.year}</p>
              <p><strong>Dimensions:</strong> {artwork.width_cm} × {artwork.height_cm} cm</p>
              <p><strong>Price:</strong> {artwork.price_huf?.toLocaleString()} HUF</p>
              <p><strong>Pickup area:</strong> {artwork.pickup_area}</p>
              <p><strong>Type:</strong> {artwork.type_of_art}</p>
            </div>

            <ApproveRejectButtons artworkId={artwork.id} />
          </div>
          )
        })}
      </div>
    </div>
  )
}
