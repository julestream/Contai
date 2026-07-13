'use client'
import { useState, useRef } from 'react'
import BackButton from '@/components/ui/BackButton'

export default function ArtworkGallery({ images }: { images: string[] }) {
  const [active, setActive] = useState(0)
  const [zoomed, setZoomed] = useState(false)
  const touchStartX = useRef<number | null>(null)
  const touchStartY = useRef<number | null>(null)
  const moved = useRef(false)

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
    touchStartY.current = e.touches[0].clientY
    moved.current = false
  }

  function onTouchMove(e: React.TouchEvent) {
    if (touchStartX.current === null) return
    const dx = Math.abs(e.touches[0].clientX - touchStartX.current)
    const dy = Math.abs(e.touches[0].clientY - (touchStartY.current ?? 0))
    if (dx > 10 || dy > 10) moved.current = true
  }

  function onTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return
    const endX = e.changedTouches[0].clientX
    const distance = touchStartX.current - endX
    const threshold = 50
    if (Math.abs(distance) > threshold) {
      if (distance > 0) goTo(active + 1)
      else goTo(active - 1)
    } else if (!moved.current) {
      setZoomed(true)
    }
    touchStartX.current = null
    touchStartY.current = null
  }

  return (
    <div>
      <div
        style={{ position: 'relative', paddingTop: '8px' }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <BackButton fallback="/browse" />
        <img
          src={images[active]}
          onClick={() => setZoomed(true)}
          style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', display: 'block', cursor: 'zoom-in' }}
        />

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
    </div>
  )
}