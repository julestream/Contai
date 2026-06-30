'use client'
import { useState } from 'react'
import BackButton from '@/components/ui/BackButton'

export default function ArtworkGallery({ images }: { images: string[] }) {
  const [active, setActive] = useState(0)

  if (!images || images.length === 0) {
    return (
      <div style={{ position: 'relative' }}>
        <BackButton fallback="/browse" />
        <div style={{ width: '100%', aspectRatio: '1', backgroundColor: '#f5f3ef' }} />
      </div>
    )
  }

  return (
    <div>
      {/* Main image with back button */}
      <div style={{ position: 'relative' }}>
        <BackButton fallback="/browse" />
        <img src={images[active]} style={{ width: '100%', aspectRatio: '1', objectFit: 'cover' }} />
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div style={{ display: 'flex', gap: '8px', padding: '12px', overflowX: 'auto' }}>
          {images.map((url, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              style={{
                padding: 0, border: 'none', background: 'none', cursor: 'pointer', flexShrink: 0,
                borderRadius: '4px', overflow: 'hidden',
                outline: i === active ? '2px solid #0a0a0a' : '2px solid transparent',
                opacity: i === active ? 1 : 0.65,
                transition: 'opacity 0.15s',
              }}
            >
              <img src={url} style={{ width: '60px', height: '60px', objectFit: 'cover', display: 'block' }} />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}