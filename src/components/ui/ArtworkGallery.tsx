'use client'
import { useState } from 'react'
import BackButton from '@/components/ui/BackButton'
import { ChevronLeft, ChevronRight } from 'lucide-react'

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

  const count = images.length

  function goTo(i: number) {
    if (i < 0) i = count - 1
    if (i >= count) i = 0
    setActive(i)
  }

  return (
    <div>
      {/* Main image — full artwork on soft matting, with back button + arrows */}
      <div style={{ position: 'relative', background: '#f5f3ef' }}>
        <BackButton fallback="/browse" />

        <div style={{
          width: '100%',
          height: '68vh',
          maxHeight: '520px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '8px',
        }}>
          <img
            src={images[active]}
            alt=""
            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', display: 'block' }}
          />
        </div>

        {/* Arrows (work on both click and tap) */}
        {count > 1 && (
          <>
            <button
              onClick={() => goTo(active - 1)}
              aria-label="Previous photo"
              style={{
                position: 'absolute', top: '50%', left: '10px', transform: 'translateY(-50%)',
                width: 38, height: 38, borderRadius: 999, border: 'none', cursor: 'pointer',
                background: 'rgba(10,10,10,0.55)', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                backdropFilter: 'blur(4px)',
              }}
            >
              <ChevronLeft size={22} />
            </button>
            <button
              onClick={() => goTo(active + 1)}
              aria-label="Next photo"
              style={{
                position: 'absolute', top: '50%', right: '10px', transform: 'translateY(-50%)',
                width: 38, height: 38, borderRadius: 999, border: 'none', cursor: 'pointer',
                background: 'rgba(10,10,10,0.55)', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                backdropFilter: 'blur(4px)',
              }}
            >
              <ChevronRight size={22} />
            </button>
          </>
        )}

        {/* Dot indicators */}
        {count > 1 && (
          <div style={{
            position: 'absolute', bottom: '12px', left: 0, right: 0,
            display: 'flex', justifyContent: 'center', gap: '6px',
          }}>
            {images.map((_, i) => (
              <span key={i} style={{
                width: i === active ? '8px' : '6px',
                height: i === active ? '8px' : '6px',
                borderRadius: '999px',
                background: i === active ? '#0a0a0a' : 'rgba(10,10,10,0.3)',
                transition: 'all 0.15s',
              }} />
            ))}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {count > 1 && (
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