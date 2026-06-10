interface LogoProps {
  dark?: boolean
  size?: number
}

export default function Logo({ dark = false, size = 0.75 }: LogoProps) {
  const color = dark ? '#ffffff' : '#0a0a0a'
  const subColor = dark ? 'rgba(255,255,255,0.65)' : 'rgba(0,0,0,0.5)'
  const fraunces = 'var(--font-fraunces), Georgia, serif'

  return (
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
}
