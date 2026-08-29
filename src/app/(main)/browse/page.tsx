import Link from 'next/link'
import { cookies } from 'next/headers'
import { getDict, DEFAULT_LANG, Lang } from '@/i18n/dictionaries'
import { PAGE_BG } from '@/lib/browseStyle'

export default function BrowsePage() {
  const lang = (cookies().get('contai_lang')?.value as Lang) || DEFAULT_LANG
  const dict = getDict(lang)
  const b = dict.browse

  // Two prominent tiles, then three smaller. The `filter` values are the
  // database's own type_of_art values and are never translated —
  // 'Print' now reads as Prints & Graphics, 'Graphic Art' as Drawing & Mixed Media.
  const PRIMARY = [
    { num: '01', label: b.paintings, filter: 'Painting', icon: '/categories/01-paintings.jpg' },
    { num: '02', label: b.sculptures, filter: 'Sculpture', icon: '/categories/02-sculptures.jpg' },
  ]
  const SECONDARY = [
    { num: '03', label: b.prints, filter: 'Print', icon: '/categories/03-graphic-art.jpg' },
    { num: '04', label: b.photography, filter: 'Photography', icon: '/categories/04-photography.jpg' },
    { num: '05', label: b.graphicArt, filter: 'Graphic Art', icon: '/categories/05-prints.jpg' },
  ]

  const tileLink: React.CSSProperties = {
    textDecoration: 'none',
    position: 'relative',
    display: 'block',
    overflow: 'hidden',
    borderRadius: '3px',
    minHeight: 0,
  }

  const scrim: React.CSSProperties = {
    position: 'absolute', inset: 0,
    background: 'linear-gradient(to top, rgba(0,0,0,0.62) 0%, rgba(0,0,0,0.2) 42%, rgba(0,0,0,0) 72%)',
    pointerEvents: 'none',
  }

  const img: React.CSSProperties = {
    width: '100%', height: '100%',
    objectFit: 'cover', objectPosition: 'center',
    display: 'block',
  }

  return (
    <div style={{ background: PAGE_BG, height: 'calc(100vh - 150px)', overflow: 'hidden' }}>
      <div style={{
        maxWidth: '430px', margin: '0 auto', height: '100%',
        display: 'flex', flexDirection: 'column',
        padding: '14px 12px 12px',
      }}>
        <h1 style={{
          fontFamily: 'var(--font-fraunces), Georgia, serif',
          fontSize: '25px', letterSpacing: '-0.01em', color: '#1a1a1a',
          marginBottom: '12px', flexShrink: 0,
        }}>
          {dict.nav.browse}
        </h1>

        {/* Two large tiles */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px',
          flex: 1.35, minHeight: 0, marginBottom: '8px',
        }}>
          {PRIMARY.map(c => (
            <Link key={c.filter} href={`/browse/results?type=${encodeURIComponent(c.filter)}`} style={tileLink}>
              <img src={c.icon} alt={c.label} style={img} />
              <div style={scrim} />
              <div style={{
                position: 'absolute', left: '12px', bottom: '10px', right: '10px',
                display: 'flex', alignItems: 'baseline', gap: '9px', pointerEvents: 'none',
              }}>
                <span style={{ fontFamily: 'var(--font-instrument), sans-serif', fontSize: '9px', color: 'rgba(255,255,255,0.7)' }}>{c.num}</span>
                <span style={{
                  fontFamily: 'var(--font-instrument), sans-serif', fontSize: '12.5px',
                  letterSpacing: '0.14em', color: '#fff', textShadow: '0 1px 3px rgba(0,0,0,0.45)',
                }}>{c.label}</span>
              </div>
            </Link>
          ))}
        </div>

        {/* Three smaller tiles */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px',
          flex: 1, minHeight: 0,
        }}>
          {SECONDARY.map(c => (
            <Link key={c.filter} href={`/browse/results?type=${encodeURIComponent(c.filter)}`} style={tileLink}>
              <img src={c.icon} alt={c.label} style={img} />
              <div style={scrim} />
              <div style={{
                position: 'absolute', left: '8px', bottom: '8px', right: '6px',
                pointerEvents: 'none',
              }}>
                <div style={{ fontFamily: 'var(--font-instrument), sans-serif', fontSize: '8.5px', color: 'rgba(255,255,255,0.7)', marginBottom: '2px' }}>{c.num}</div>
                <div style={{
                  fontFamily: 'var(--font-instrument), sans-serif', fontSize: '10px',
                  letterSpacing: '0.06em', lineHeight: 1.3, color: '#fff',
                  textShadow: '0 1px 3px rgba(0,0,0,0.45)',
                }}>{c.label}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}