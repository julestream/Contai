import type { CSSProperties } from 'react'

// ─────────────────────────────────────────────────────────────
// The whole browse look lives here. Retune once, everything follows.
// ─────────────────────────────────────────────────────────────

// ⬇︎ THE ONE LINE TO FLIP
// Warm tinted page: '#faf7f2'   ·   Plain white page: '#ffffff'
export const PAGE_BG = '#faf7f2'

// The panel each artwork floats on
export const FRAME_BG = '#f1ece4'
export const FRAME_RATIO = '4 / 5'   // portrait — suits paintings
export const FRAME_PAD = '16px'
export const FRAME_RADIUS = '3px'

// Grid rhythm — the generous row gap is most of the editorial feel
export const GRID: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  columnGap: '14px',
  rowGap: '34px',
  padding: '0 1.15rem',
}

export const frameStyle: CSSProperties = {
  background: FRAME_BG,
  aspectRatio: FRAME_RATIO,
  borderRadius: FRAME_RADIUS,
  padding: FRAME_PAD,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'hidden',
}

// contain, never cover — an artwork should never be cropped
export const artStyle: CSSProperties = {
  maxWidth: '100%',
  maxHeight: '100%',
  width: 'auto',
  height: 'auto',
  objectFit: 'contain',
  display: 'block',
  filter: 'drop-shadow(0 5px 14px rgba(0,0,0,0.16))',
}

export const artistStyle: CSSProperties = {
  fontSize: '9.5px',
  letterSpacing: '0.15em',
  textTransform: 'uppercase',
  color: '#a49d92',
  marginTop: '12px',
}

export const titleStyle: CSSProperties = {
  fontFamily: 'var(--font-fraunces), Georgia, serif',
  fontSize: '13.5px',
  lineHeight: 1.3,
  color: '#1a1a1a',
  marginTop: '5px',
}

export const priceStyle: CSSProperties = {
  display: 'block',
  fontSize: '12.5px',
  color: '#8a857c',
  marginTop: '4px',
}

// Page chrome
export const pageWrap: CSSProperties = {
  background: PAGE_BG,
  minHeight: '100%',
}

export const innerWrap: CSSProperties = {
  maxWidth: '430px',
  margin: '0 auto',
  paddingBottom: '6rem',
}

export const headerWrap: CSSProperties = {
  padding: '1.5rem 1.15rem 0.25rem',
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
}

export const headingStyle: CSSProperties = {
  fontFamily: 'var(--font-fraunces), Georgia, serif',
  fontSize: '25px',
  letterSpacing: '-0.01em',
  color: '#1a1a1a',
}

export const countStyle: CSSProperties = {
  padding: '2px 1.15rem 22px',
  color: '#a49d92',
  fontSize: '11px',
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
}

export const emptyStyle: CSSProperties = {
  padding: '4rem 2rem',
  textAlign: 'center',
  color: '#a49d92',
  fontSize: '14px',
}