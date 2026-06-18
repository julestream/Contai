'use client'

import { useEffect } from 'react'

export default function RecordView({ artworkId }: { artworkId: string }) {
  useEffect(() => {
    fetch('/api/record-view', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ artworkId }),
    }).catch(() => {})
  }, [artworkId])

  return null
}