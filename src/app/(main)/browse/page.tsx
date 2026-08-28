import Link from 'next/link'
import { cookies } from 'next/headers'
import { getDict, DEFAULT_LANG, Lang } from '@/i18n/dictionaries'
import { PAGE_BG } from '@/lib/browseStyle'

export default function BrowsePage() {
  const lang = (cookies().get('contai_lang')?.value as Lang) || DEFAULT_LANG
  const b = getDict(lang).browse

  const CATEGORIES = [
    { num: '01', label: b.paintings, filter: 'Painting', icon: '/categories/01-paintings.jpg' },
    { num: '02', label: b.sculptures, filter: 'Sculpture', icon: '/categories/02-sculptures.jpg' },
    { num: '03', label: b.graphicArt, filter: 'Graphic Art', icon: '/categories/03-graphic-art.jpg' },
    { num: '04', label: b.photography, filter: 'Photography', icon: '/categories/04-photography.jpg' },
    { num: '05', label: b.prints, filter: 'Print', icon: '/categories/05-prints.jpg' },
  ]

  return (
    <div style={{ background: PAGE_BG, height: 'calc(100vh - 150px)', overflow: 'hidden' }}>
      <div style={{
        maxWidth: '430px', margin: '0 auto',
        height: '100%',
        display: 'flex', flexDirection: 'column',
      }}>
        {CATEGORIES.map(c => (
          <Link
            key={c.filter}
            href={`/browse/results?type=${encodeURIComponent(c.filter)}`}
            style={{
              textDecoration: 'none',
              // Equal share of the available height — five rows, always one screen.
              flex: 1,
              minHeight: 0,
              position: 'relative',
              display: 'block',
              overflow: 'hidden',
            }}
          >
            <img
              src={c.icon}
              alt={c.label}
              style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block' }}
            />

            {/* A gradient rather than a flat panel — the image stays visible
                and the text still has something solid to sit against.
                Two of these photographs are near-white, so the scrim has to
                be dark enough to carry white type over any of them. */}
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(to top, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.25) 38%, rgba(0,0,0,0) 70%)',
              pointerEvents: 'none',
            }} />

            <div style={{
              position: 'absolute', left: '16px', bottom: '12px',
              display: 'flex', alignItems: 'baseline', gap: '10px',
              pointerEvents: 'none',
            }}>
              <span style={{
                fontFamily: 'var(--font-instrument), sans-serif',
                fontSize: '9px', color: 'rgba(255,255,255,0.72)',
              }}>{c.num}</span>
              <span style={{
                fontFamily: 'var(--font-instrument), sans-serif',
                fontSize: '13px', letterSpacing: '0.18em', color: '#ffffff',
                textShadow: '0 1px 3px rgba(0,0,0,0.4)',
              }}>{c.label}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}