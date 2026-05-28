import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DocumentActions from './DocumentActions'

export default async function AdminDocumentsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/signin')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/')

  const { data: documents } = await supabase
    .from('verification_documents')
    .select('*, profiles(full_name)')
    .eq('status', 'pending')
    .order('created_at', { ascending: true })

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '28px', marginBottom: '2rem' }}>
        Verification Documents ({documents?.length || 0})
      </h1>

      {documents?.length === 0 && (
        <p style={{ color: '#999' }}>No documents pending review.</p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {documents?.map(doc => (
          <div key={doc.id} style={{ padding: '1.5rem', border: '1px solid #e8e8e8', borderRadius: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontWeight: 600 }}>{(doc as any).profiles?.full_name}</p>
                <p style={{ color: '#666', fontSize: '14px', marginTop: '4px', textTransform: 'capitalize' }}>
                  {doc.document_type.replace('_', ' ')}
                </p>
                <p style={{ color: '#999', fontSize: '12px', marginTop: '4px' }}>{doc.storage_path}</p>
              </div>
              <DocumentActions docId={doc.id} profileId={doc.profile_id} docType={doc.document_type} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
