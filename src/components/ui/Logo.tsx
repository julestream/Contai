import Link from 'next/link'

interface LogoProps {
  dark?: boolean
  size?: number
  /** Set false where the logo sits inside another link, to avoid nesting. */
  link?: boolean
}

export default function Logo({ dark = false, size = 0.75, link = true }: LogoProps) {
  const color = dark ? '#ffffff' : '#0a0a0a'
  const subColor = dark ? 'rgba(255,255,255,0.65)' : 'rgba(0,0,0,0.5)'
  const fraunces = 'var(--font-fraunces), Georgia, serif'

  const mark = (
    <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'stretch', textAlign: 'center' }}>
      <div style={{
        fontFamily: fraunces,
        fontSize: `${48 * size}px`,
        fontWeight: 500,
        color,
        letterSpacing: '-0.01em',
        lineHeight: 1,
      }}>
        cont<span style={{ fontStyle: 'italic' }}>ai</span>
      </div>
      <div style={{
        fontFamily: 'system-ui, sans-serif',
        fontSize: `${12 * size}px`,
        color: subColor,
        letterSpacing: '0.34em',
        textTransform: 'uppercase',
        marginTop: `${3 * size}px`,
        paddingLeft: '0.34em',
        whiteSpace: 'nowrap',
      }}>
        The Art Market
      </div>
    </div>
  )

  // The sign-in and sign-up pages sit outside the app's navigation, so
  // someone who lands there and changes their mind had no way back to the
  // gallery. The wordmark is where everyone instinctively taps.
  if (!link) return mark

  return (
    <Link href="/home" style={{ textDecoration: 'none', display: 'inline-block' }}>
      {mark}
    </Link>
  )
}