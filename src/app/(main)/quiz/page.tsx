'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type Letter = 'a' | 'b' | 'c' | 'd' | 'e'

const QUESTIONS: { q: string; options: { letter: Letter; text: string }[] }[] = [
  {
    q: 'What type of artwork brings you the most happiness?',
    options: [
      { letter: 'a', text: 'Vibrant and energetic' },
      { letter: 'b', text: 'Serene and peaceful' },
      { letter: 'c', text: 'Playful and whimsical' },
      { letter: 'd', text: 'Expressive and lively' },
      { letter: 'e', text: 'Bright and colourful' },
    ],
  },
  {
    q: 'When you look at an artwork, what do you find yourself contemplating?',
    options: [
      { letter: 'a', text: 'The beauty of nature and the world around us' },
      { letter: 'b', text: 'The balance and unity within the artwork' },
      { letter: 'c', text: 'The enigmatic and mysterious elements it holds' },
      { letter: 'd', text: 'The sheer joy and positivity it radiates' },
      { letter: 'e', text: 'The introspection and self-discovery it encourages' },
    ],
  },
  {
    q: 'Which artworks do you feel most drawn to?',
    options: [
      { letter: 'a', text: 'Artworks that inspire and uplift' },
      { letter: 'b', text: 'Artworks that create a sense of harmony and unity' },
      { letter: 'c', text: 'Artworks that challenge societal norms and provoke discussion' },
      { letter: 'd', text: 'Artworks that evoke joy and happiness' },
      { letter: 'e', text: 'Artworks that encourage self-reflection and introspection' },
    ],
  },
  {
    q: 'What motivates you the most when viewing art?',
    options: [
      { letter: 'a', text: 'The inspiration it ignites within you' },
      { letter: 'b', text: 'The sense of harmony and balance it portrays' },
      { letter: 'c', text: 'The mysteries and hidden meanings it holds' },
      { letter: 'd', text: 'The joy and positivity it radiates' },
      { letter: 'e', text: 'The drive and determination it instills to pursue dreams' },
    ],
  },
  {
    q: 'Which artwork would intrigue you the most?',
    options: [
      { letter: 'a', text: 'Artworks that challenge traditional notions and push boundaries' },
      { letter: 'b', text: 'Artworks that create a sense of harmony and balance' },
      { letter: 'c', text: 'Artworks that hold secrets and invite interpretation' },
      { letter: 'd', text: 'Artworks that evoke a sense of joy and playfulness' },
      { letter: 'e', text: 'Artworks that encourage introspection and self-discovery' },
    ],
  },
]

const RESULTS: Record<Letter, { mood: string; blurb: string }> = {
  a: { mood: 'Inspiration', blurb: 'You seek art that ignites ideas and lifts you toward something greater.' },
  b: { mood: 'Harmony', blurb: 'You are drawn to balance, unity, and a sense of calm wholeness.' },
  c: { mood: 'Intrigue', blurb: 'You love mystery, hidden meaning, and art that invites interpretation.' },
  d: { mood: 'Joy', blurb: 'You search for warmth, playfulness, and pure positive energy.' },
  e: { mood: 'Self-reflection', blurb: 'You connect with art that turns the gaze inward and sparks discovery.' },
}

export default function QuizPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [counts, setCounts] = useState<Record<Letter, number>>({ a: 0, b: 0, c: 0, d: 0, e: 0 })
  const [done, setDone] = useState(false)
  const [result, setResult] = useState<Letter | null>(null)

  function choose(letter: Letter) {
    const next = { ...counts, [letter]: counts[letter] + 1 }
    setCounts(next)
    if (step < QUESTIONS.length - 1) {
      setStep(step + 1)
    } else {
      // find highest
      let best: Letter = 'a'
      ;(Object.keys(next) as Letter[]).forEach(l => { if (next[l] > next[best]) best = l })
      setResult(best)
      setDone(true)
    }
  }

  if (done && result) {
    const r = RESULTS[result]
    return (
      <div style={{ maxWidth: '430px', margin: '0 auto', padding: '3rem 1.5rem', textAlign: 'center', minHeight: '70vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <p style={{ fontSize: '13px', color: '#999', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Your art mood is</p>
        <h1 style={{ fontFamily: 'var(--font-fraunces), Georgia, serif', fontSize: '40px', margin: '10px 0 16px' }}>{r.mood}</h1>
        <p style={{ fontSize: '15px', color: '#555', lineHeight: 1.6, marginBottom: '2rem' }}>{r.blurb}</p>
        <Link href={`/browse/results?mood=${r.mood}`} style={{ textDecoration: 'none' }}>
          <div style={{ padding: '15px', background: '#0a0a0a', color: '#fff', borderRadius: '999px', fontSize: '16px', fontWeight: 600 }}>
            Explore {r.mood} artworks
          </div>
        </Link>
        <button onClick={() => { setStep(0); setCounts({ a: 0, b: 0, c: 0, d: 0, e: 0 }); setDone(false); setResult(null) }}
          style={{ marginTop: '14px', background: 'none', border: 'none', color: '#999', fontSize: '14px', cursor: 'pointer' }}>
          Take the quiz again
        </button>
      </div>
    )
  }

  const current = QUESTIONS[step]

  return (
    <div style={{ maxWidth: '430px', margin: '0 auto', padding: '2rem 1.5rem', minHeight: '70vh' }}>
      {/* Progress */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '2rem' }}>
        {QUESTIONS.map((_, i) => (
          <div key={i} style={{ flex: 1, height: '3px', borderRadius: '999px', background: i <= step ? '#0a0a0a' : '#e0dcd3' }} />
        ))}
      </div>

      <p style={{ fontSize: '13px', color: '#999', marginBottom: '8px' }}>Question {step + 1} of {QUESTIONS.length}</p>
      <h1 style={{ fontFamily: 'var(--font-fraunces), Georgia, serif', fontSize: '24px', lineHeight: 1.3, marginBottom: '2rem' }}>{current.q}</h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {current.options.map(opt => (
          <button key={opt.letter} onClick={() => choose(opt.letter)}
            style={{
              textAlign: 'left', padding: '16px', borderRadius: '12px', border: '1px solid #e0dcd3',
              background: '#fff', fontSize: '15px', color: '#0a0a0a', cursor: 'pointer', lineHeight: 1.4,
              fontFamily: 'var(--font-instrument), sans-serif',
            }}>
            {opt.text}
          </button>
        ))}
      </div>
    </div>
  )
}