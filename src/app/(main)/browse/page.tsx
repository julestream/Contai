import Link from 'next/link'
import { cookies } from 'next/headers'
import { getDict, DEFAULT_LANG, Lang } from '@/i18n/dictionaries'
import { PAGE_BG } from '@/lib/browseStyle'

export default function BrowsePage() {
  const lang = (cookies().get('contai_lang')?.value as Lang) || DEFAULT_LANG
  const dict = getDict(lang)
  const b = dict.browse

  // The `filter` values are the database's own type_of_art values and are
  // never translated.
  const PRIMARY = [
    { num: '01', label: b.paintings, filter: 'Painting', icon: '/categories/01-paintings.jpg' },
    { num: '02', label: b.sculptures, filter: 'Sculpture', icon: '/categories/02-sculptures.jpg' },
  ]
  const SECONDARY = [
    { num: '03', label: b.prints, filter: 'Print', icon: '/categories/03-graphic-art.jpg' },
    { num: '04', label: b.photography, filter: 'Photography', icon: '/categories/04-photography.jpg' },
    { num: '05', label: b.graphicArt, filter: 'Decorative Arts', icon: '/categories/05-prints.jpg' },
  ]
  const ALL = [...PRIMARY, ...SECONDARY]

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

  function Tile({ c, small }: { c: typeof ALL[number]; small?: boolean }) {
    return (
      <Link
        key={c.filter}
        href={`/browse/results?type=${encodeURIComponent(c.filter)}`}
        style={tileLink}
        className="browse-tile"
      >
        <img src={c.icon} alt={c.label} style={img} />
        <div style={scrim} />
        <div style={{
          position: 'absolute', left: small ? '8px' : '12px', bottom: small ? '8px' : '10px',
          right: small ? '6px' : '10px', pointerEvents: 'none',
        }}>
          <div style={{
            fontFamily: 'var(--font-instrument), sans-serif',
            fontSize: small ? '8.5px' : '9px',
            color: 'rgba(255,255,255,0.7)', marginBottom: '2px',
          }}>{c.num}</div>
          <div style={{
            fontFamily: 'var(--font-instrument), sans-serif',
            fontSize: small ? '10px' : '12.5px',
            letterSpacing: small ? '0.06em' : '0.14em',
            lineHeight: 1.3, color: '#fff',
            textShadow: '0 1px 3px rgba(0,0,0,0.45)',
          }}>{c.label}</div>
        </div>
      </Link>
    )
  }

  return (
    <div className="browse-page" style={{ background: PAGE_BG, height: 'calc(100vh - 150px)', overflow: 'hidden' }}>

      {/* Phone: two large tiles above three smaller ones, filling one screen. */}
      <div className="mobile-only" style={{
        maxWidth: '430px', margin: '0 auto', height: '100%',
        display: 'flex', flexDirection: 'column',
        padding: '12px 12px',
      }}>
        <h1 style={{
          fontFamily: 'var(--font-fraunces), Georgia, serif',
          fontSize: '25px', letterSpacing: '-0.01em', color: '#1a1a1a',
          marginBottom: '10px', flexShrink: 0,
        }}>
          {dict.nav.browse}
        </h1>

        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px',
          flex: 1.35, minHeight: 0, marginBottom: '8px',
        }}>
          {PRIMARY.map(c => <Tile key={c.filter} c={c} />)}
        </div>

        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px',
          flex: 1, minHeight: 0,
        }}>
          {SECONDARY.map(c => <Tile key={c.filter} c={c} small />)}
        </div>
      </div>

      {/* Desktop: all five side by side. The phone's stacked arrangement
          would become five very wide, short bands on a laptop. */}
      <div className="desktop-only">
        <div style={{ maxWidth: '1120px', margin: '0 auto', padding: '1.5rem 2rem 0' }}>
          <h1 style={{
            fontFamily: 'var(--font-fraunces), Georgia, serif',
            fontSize: '30px', letterSpacing: '-0.01em', color: '#1a1a1a',
            marginBottom: '1.25rem',
          }}>
            {dict.nav.browse}
          </h1>
        </div>
        <div className="browse-tiles">
          {ALL.map(c => <Tile key={c.filter} c={c} />)}
        </div>
      </div>
    </div>
  )
}