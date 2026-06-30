'use client'
import { useState, useRef } from 'react'
import BackButton from '@/components/ui/BackButton'

export default function ArtworkGallery({ images }: { images: string[] }) {
  const [active, setActive] = useState(0)
  const touchStartX = useRef<number | null>(null)
  const touchEndX = useRef<number | null>(null)

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

  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX
    touchEndX.current = null
  }

  function onTouchMove(e: React.TouchEvent) {
    touchEndX.current = e.touches[0].clientX
  }

  function onTouchEnd() {
    if (touchStartX.current === null || touchEndX.current === null) return
    const distance = touchStartX.current - touchEndX.current
    const threshold = 50 // minimum px to count as a swipe
    if (distance > threshold) goTo(active + 1)        // swiped left → next
    else if (distance < -threshold) goTo(active - 1)  // swiped right → previous
    touchStartX.current = null
    touchEndX.current = null
  }

  return (
    <div>
      {/* Main image — swipeable, with back button */}
      <div
        style={{ position: 'relative' }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <BackButton fallback="/browse" />
        <img src={images[active]} style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', display: 'block' }} />

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
                background: i === active ? '#ffffff' : 'rgba(255,255,255,0.55)',
                boxShadow: '0 0 2px rgba(0,0,0,0.4)',
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