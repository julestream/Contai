import { cookies } from 'next/headers'
import { getDict, DEFAULT_LANG, Lang } from '@/i18n/dictionaries'

// '70 × 90 cm' is a number almost nobody can picture on their own wall.
// Drawing the work beside a person answers the commonest unasked question
// about buying art online, using data we already hold.

const PERSON_CM = 170          // average adult height, the reference
const MAX_HEIGHT_PX = 150      // how tall the tallest element may draw
const PERSON_WIDTH_RATIO = 0.26 // shoulder width relative to height

export default function ScaleFigure({
  widthCm,
  heightCm,
  depthCm,
}: {
  widthCm?: number | null
  heightCm?: number | null
  depthCm?: number | null
}) {
  // Never render an empty box — a listing without measurements simply
  // doesn't get the drawing.
  if (!widthCm || !heightCm) return null

  const lang = (cookies().get('contai_lang')?.value as Lang) || DEFAULT_LANG
  const a = (getDict(lang) as any).artwork

  // Scale everything against whichever is taller, so a very large work and
  // a very small one both stay readable in the same amount of space.
  const tallestCm = Math.max(heightCm, PERSON_CM)
  const pxPerCm = MAX_HEIGHT_PX / tallestCm

  const artH = heightCm * pxPerCm
  const artW = widthCm * pxPerCm
  const personH = PERSON_CM * pxPerCm
  const personW = personH * PERSON_WIDTH_RATIO

  // A work wider than the drawing area would push the figure off screen.
  const MAX_WIDTH_PX = 190
  const overflow = artW > MAX_WIDTH_PX
  const shrink = overflow ? MAX_WIDTH_PX / artW : 1
  const drawnArtW = artW * shrink
  const drawnArtH = artH * shrink
  const drawnPersonH = personH * shrink
  const drawnPersonW = personW * shrink

  const baseline = Math.max(drawnArtH, drawnPersonH)

  return (
    <div style={{
      marginTop: '1.5rem', padding: '1.25rem 1rem 1rem',
      background: '#f5f3ef', borderRadius: '8px',
    }}>
      <p style={{
        fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase',
        color: '#a49d92', marginBottom: '1rem',
      }}>
        {a.scaleLabel}
      </p>

      <div style={{
        display: 'flex', alignItems: 'flex-end', gap: '18px',
        height: `${baseline + 4}px`,
      }}>
        {/* The work */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
          <div style={{
            width: `${drawnArtW}px`,
            height: `${drawnArtH}px`,
            background: '#ffffff',
            border: '1px solid #c8c2b6',
            borderRadius: '1px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.09)',
          }} />
        </div>

        {/* The person — a plain silhouette, deliberately featureless so it
            reads as a measuring stick rather than a character. */}
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          height: `${drawnPersonH}px`, justifyContent: 'flex-end',
        }}>
          <svg
            width={drawnPersonW}
            height={drawnPersonH}
            viewBox="0 0 26 100"
            preserveAspectRatio="none"
            aria-hidden
          >
            {/* head */}
            <circle cx="13" cy="7" r="6" fill="#c8c2b6" />
            {/* body and legs as one simple shape */}
            <path
              d="M13 14 C6 14 4 20 4 30 L4 52 L8 52 L8 98 L11.5 98 L11.5 62 L14.5 62 L14.5 98 L18 98 L18 52 L22 52 L22 30 C22 20 20 14 13 14 Z"
              fill="#c8c2b6"
            />
          </svg>
        </div>
      </div>

      {/* Baseline both stand on */}
      <div style={{ height: '1px', background: '#d8d2c6', marginTop: '4px' }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', gap: '12px' }}>
        <p style={{ fontSize: '12.5px', color: '#5a5246' }}>
          {widthCm} × {heightCm}{depthCm ? ` × ${depthCm}` : ''} cm
        </p>
        <p style={{ fontSize: '12px', color: '#a49d92' }}>
          {a.scalePerson}
        </p>
      </div>
    </div>
  )
}