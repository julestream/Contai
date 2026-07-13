'use client'
import { useState } from 'react'
import BackButton from '@/components/ui/BackButton'
import { ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react'

export default function ArtworkGallery({ images }: { images: string[] }) {
  const [active, setActive] = useState(0)
  const [zoomed, setZoomed] = useState(false)

  const count = images?.length || 0

  function goTo(i: number) {
    if (i < 0) i = count - 1
    if (i >= count) i = 0
    setActive(i)
  }

  return (
    <div>
      {/* Header row: back arrow in normal page flow */}
      <div style={{ padding: '12px 1rem 8px' }}>
        <BackButton fallback="/browse" />
      </div>

      {count === 0 ? (
        <div style={{ width: '100%', aspectRatio: '1', backgroundColor: '#f5f3ef' }} />
      ) : (
        <>
          {/* Main image — natural shape on soft matting */}
          <div style={{ position: 'relative', background: '#f5f3ef', display: 'flex', justifyContent: 'center' }}>
            <img
              src={images[active]}
              alt=""
              style={{
                width: '100%',
                height: 'auto',
                maxHeight: '62vh',
                objectFit: 'contain',
                display: 'block',
              }}
            />

            {/* Magnifier button */}
            <button
              onClick={() => setZoomed(true)}
              aria-label="View larger"
              style={{
                position: 'absolute', bottom: '10px', right: '10px',
                width: 34, height: 34, borderRadius: 999, border: 'none', cursor: 'pointer',
                background: 'rgba(10,10,10,0.5)', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                backdropFilter: 'blur(4px)',
              }}
            >
              <Maximize2 size={16} />
            </button>

            {/* Photo arrows */}
            {count > 1 && (
              <>
                <button
                  onClick={() => goTo(active - 1)}
                  aria-label="Previous photo"
                  style={{
                    position: 'absolute', top: '50%', left: '8px', transform: 'translateY(-50%)',
                    width: 32, height: 32, borderRadius: 999, border: 'none', cursor: 'pointer',
                    background: 'rgba(10,10,10,0.4)', color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <ChevronLeft size={19} />
                </button>
                <button
                  onClick={() => goTo(active + 1)}
                  aria-label="Next photo"
                  style={{
                    position: 'absolute', top: '50%', right: '8px', transform: 'translateY(-50%)',
                    width: 32, height: 32, borderRadius: 999, border: 'none', cursor: 'pointer',
                    background: 'rgba(10,10,10,0.4)', color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <ChevronRight size={19} />
                </button>
              </>
            )}
          </div>

          {/* Dots */}
          {count > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', padding: '10px 0 0' }}>
              {images.map((_, i) => (
                <span key={i} style={{
                  width: i === active ? '8px' : '6px',
                  height: i === active ? '8px' : '6px',
                  borderRadius: '999px',
                  background: i === active ? '#0a0a0a' : 'rgba(10,10,10,0.25)',
                  transition: 'all 0.15s',
                }} />
              ))}
            </div>
          )}

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

          {/* Full-screen zoom overlay */}
          {zoomed && (
            <div
              onClick={() => setZoomed(false)}
              style={{
                position: 'fixed', inset: 0, zIndex: 100,
                background: 'rgba(0,0,0,0.92)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '1rem', cursor: 'zoom-out',
              }}
            >
              <img
                src={images[active]}
                style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
              />
              <button
                onClick={(e) => { e.stopPropagation(); setZoomed(false) }}
                aria-label="Close"
                style={{
                  position: 'absolute', top: '1rem', right: '1rem',
                  width: 40, height: 40, borderRadius: 999, border: 'none',
                  background: 'rgba(255,255,255,0.15)', color: '#fff', fontSize: 22, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                ×
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}