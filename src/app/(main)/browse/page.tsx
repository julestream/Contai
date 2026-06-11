import Link from 'next/link'

const CATEGORIES = [
  { num: '01', label: 'PAINTINGS', filter: 'Painting', icon: '/categories/01-paintings.svg' },
  { num: '02', label: 'SCULPTURES', filter: 'Sculpture', icon: '/categories/02-sculptures.svg' },
  { num: '03', label: 'GRAPHIC ART', filter: 'Graphic Art', icon: '/categories/03-graphic-art.svg' },
  { num: '04', label: 'PHOTOGRAPHY', filter: 'Photography', icon: '/categories/04-photography.svg' },
  { num: '05', label: 'PRINTS', filter: 'Print', icon: '/categories/05-prints.svg' },
]

export default function BrowsePage() {
  return (
    <div style={{
      maxWidth: '430px', margin: '0 auto', minHeight: '100vh',
      background: '#ffffff', display: 'flex', flexDirection: 'column',
      padding: '8px 20px 96px',
    }}>
      {CATEGORIES.map(c => (
        <Link key={c.filter} href={`/browse/results?type=${encodeURIComponent(c.filter)}`}
          style={{ textDecoration: 'none', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: 0 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <img src={c.icon} alt={c.label} style={{ width: '100%', maxHeight: '11vh', objectFit: 'contain', objectPosition: 'left' }} />
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
              <span style={{ fontFamily: 'var(--font-instrument), sans-serif', fontSize: '8.4px', color: '#999' }}>{c.num}</span>
              <span style={{ fontFamily: 'var(--font-instrument), sans-serif', fontSize: '12.6px', letterSpacing: '0.18em', color: '#0a0a0a' }}>{c.label}</span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}