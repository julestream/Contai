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
        padding: '10px 14px',
        gap: '10px',
      }}>
        {CATEGORIES.map(c => (
          <Link
            key={c.filter}
            href={`/browse/results?type=${encodeURIComponent(c.filter)}`}
            style={{
              textDecoration: 'none',
              // Each row takes an equal share of whatever height is available,
              // so all five always fit without scrolling.
              flex: 1,
              minHeight: 0,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* The image takes the room left after the label. */}
            <div style={{
              flex: 1, minHeight: 0, width: '100%',
              overflow: 'hidden', borderRadius: '2px',
            }}>
              <img
                src={c.icon}
                alt={c.label}
                style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block' }}
              />
            </div>
            {/* Tight under its own image — 4px reads as attached, 20px reads
                as belonging to whatever comes next. */}
            <div style={{
              display: 'flex', alignItems: 'baseline', gap: '10px',
              paddingLeft: '2px', marginTop: '4px', flexShrink: 0,
            }}>
              <span style={{ fontFamily: 'var(--font-instrument), sans-serif', fontSize: '8.4px', color: '#a49d92' }}>{c.num}</span>
              <span style={{ fontFamily: 'var(--font-instrument), sans-serif', fontSize: '12.6px', letterSpacing: '0.18em', color: '#1a1a1a' }}>{c.label}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}