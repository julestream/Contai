'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

const DOC_TYPES = [
  { key: 'id', label: 'ID Document', description: 'Passport or national ID — required to list artwork' },
  { key: 'cv', label: 'CV / Portfolio', description: 'Optional — for verification and artist badge' },
  { key: 'certificate', label: 'Certificate of Authenticity', description: 'Optional — proof of artwork authenticity' },
  { key: 'provenance', label: 'Provenance Document', description: 'Optional — artwork history documentation' },
]

export default function VerificationPage() {
  const [documents, setDocuments] = useState<any[]>([])
  const [uploading, setUploading] = useState<string | null>(null)
  const [error, setError] = useState('')

  async function loadDocs() {
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return
    const { data } = await supabase
      .from('verification_documents')
      .select('*')
      .eq('profile_id', session.user.id)
    setDocuments(data || [])
  }

  useEffect(() => { loadDocs() }, [])

  async function handleUpload(docType: string, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setError('')
    setUploading(docType)
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { setError('You are not signed in.'); setUploading(null); return }

    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
    const path = `${session.user.id}/${docType}-${Date.now()}-${safeName}`
    const { error: uploadError } = await supabase.storage
      .from('verification-docs')
      .upload(path, file, { upsert: true })

    if (uploadError) {
      setError('Upload failed: ' + uploadError.message)
      setUploading(null)
      return
    }

    const { error: insertError } = await supabase.from('verification_documents').insert({
      profile_id: session.user.id,
      document_type: docType,
      storage_path: path,
      status: 'pending',
    })
    if (insertError) {
      setError('Could not save document: ' + insertError.message)
      setUploading(null)
      return
    }

    await loadDocs()
    setUploading(null)
  }

  function getDocStatus(docType: string) {
    return documents.find(d => d.document_type === docType)
  }

  const hasId = !!getDocStatus('id')

  return (
    <div style={{ padding: '2rem', maxWidth: '430px', margin: '0 auto', paddingBottom: '6rem' }}>
      <h1 style={{ fontFamily: 'var(--font-fraunces), Georgia, serif', fontSize: '24px', marginBottom: '0.5rem' }}>Verification</h1>
      <p style={{ color: '#666', fontSize: '14px', marginBottom: '2rem' }}>
        Upload your ID to list artwork. CV, certificates and provenance are optional and earn extra badges.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {DOC_TYPES.map(doc => {
          const existing = getDocStatus(doc.key)
          return (
            <div key={doc.key} style={{ padding: '1rem', border: '1px solid #e8e8e8', borderRadius: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ fontWeight: 600, fontSize: '15px' }}>{doc.label}</p>
                  <p style={{ color: '#999', fontSize: '13px', marginTop: '2px' }}>{doc.description}</p>
                </div>
                {existing ? (
                  <span style={{
                    padding: '4px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: 600, textTransform: 'capitalize',
                    backgroundColor: existing.status === 'approved' ? '#eef4f1' : existing.status === 'rejected' ? '#fdf0f0' : '#f5f3ef',
                    color: existing.status === 'approved' ? '#2d6a4f' : existing.status === 'rejected' ? '#b94040' : '#666',
                  }}>
                    {existing.status === 'pending' ? 'Uploaded ✓' : existing.status}
                  </span>
                ) : (
                  <label style={{ cursor: 'pointer' }}>
                    <input type="file" onChange={e => handleUpload(doc.key, e)} style={{ display: 'none' }} />
                    <span style={{
                      padding: '8px 16px', borderRadius: '999px', fontSize: '13px',
                      backgroundColor: '#0a0a0a', color: 'white', fontWeight: 500,
                    }}>
                      {uploading === doc.key ? 'Uploading...' : 'Upload'}
                    </span>
                  </label>
                )}
              </div>
              {existing && doc.key === 'id' && (
                <p style={{ fontSize: '12px', color: '#2d6a4f', marginTop: '10px' }}>
                  Your ID is uploaded. You can now list artwork — our team will review your ID alongside your first listing.
                </p>
              )}
            </div>
          )
        })}
      </div>

      {error && <p style={{ color: '#b94040', fontSize: '14px', marginTop: '1rem' }}>{error}</p>}

      {hasId && (
        <Link href="/dashboard/upload" style={{ textDecoration: 'none' }}>
          <div style={{
            marginTop: '2rem', padding: '16px', backgroundColor: '#0a0a0a', color: 'white',
            borderRadius: '999px', textAlign: 'center', fontSize: '16px', fontWeight: 600,
          }}>
            Continue to list artwork
          </div>
        </Link>
      )}
    </div>
  )
}