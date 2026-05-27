interface LogoProps {
  dark?: boolean
  size?: number
}

export default function Logo({ dark = false, size = 1 }: LogoProps) {
  const color = dark ? '#ffffff' : '#0a0a0a'
  const subColor = dark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)'

  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{
        fontFamily: 'Georgia, serif',
        fontSize: `${28 * size}px`,
        fontWeight: 400,
        color,
        letterSpacing: '-0.02em',
        lineHeight: 1,
      }}>
        cont<span style={{ fontStyle: 'italic' }}>ai</span>
      </div>
      <div style={{
        fontFamily: 'system-ui, sans-serif',
        fontSize: `${9 * size}px`,
        color: subColor,
        letterSpacing: '0.15em',
        textTransform: 'uppercase',
        marginTop: `${4 * size}px`,
      }}>
        The Art Market
      </div>
    </div>
  )
}
