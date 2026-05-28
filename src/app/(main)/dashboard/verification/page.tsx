'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'

const DOC_TYPES = [
  { key: 'id', label: 'ID Document', description: 'Passport or national ID' },
  { key: 'certificate', label: 'Certificate of Authenticity', description: 'Proof of artwork authenticity' },
  { key: 'provenance', label: 'Provenance Document', description: 'Artwork history documentation' },
]

export default function VerificationPage() {
  const [documents, setDocuments] = useState<any[]>([])
  const [uploading, setUploading] = useState<string | null>(null)

  useEffect(() => {
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
    loadDocs()
  }, [])

  async function handleUpload(docType: string, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(docType)
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    const path = `${session.user.id}/${docType}-${Date.now()}-${file.name}`
    const { error: uploadError } = await supabase.storage
      .from('verification-docs')
      .upload(path, file)

    if (!uploadError) {
      await supabase.from('verification_documents').insert({
        profile_id: session.user.id,
        document_type: docType,
        storage_path: path,
        status: 'pending',
      })
      const { data } = await supabase
        .from('verification_documents')
        .select('*')
        .eq('profile_id', session.user.id)
      setDocuments(data || [])
    }
    setUploading(null)
  }

  function getDocStatus(docType: string) {
    return documents.find(d => d.document_type === docType)
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '430px', margin: '0 auto' }}>
      <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '24px', marginBottom: '0.5rem' }}>Verification</h1>
      <p style={{ color: '#666', fontSize: '14px', marginBottom: '2rem' }}>
        Upload documents to get verified badges on your profile.
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
                    padding: '4px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: 600,
                    backgroundColor: existing.status === 'approved' ? '#eef4f1' : existing.status === 'rejected' ? '#fdf0f0' : '#f5f3ef',
                    color: existing.status === 'approved' ? '#2d6a4f' : existing.status === 'rejected' ? '#b94040' : '#666',
                  }}>
                    {existing.status}
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
            </div>
          )
        })}
      </div>
    </div>
  )
}
