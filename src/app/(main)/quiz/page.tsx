'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useLang } from '@/i18n/LanguageProvider'
import { getQuiz, Letter } from '@/i18n/quiz'

export default function QuizPage() {
  const { lang, t } = useLang()
  const doc = getQuiz(lang)
  const QUESTIONS = doc.questions

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
      let best: Letter = 'a'
      ;(Object.keys(next) as Letter[]).forEach(l => { if (next[l] > next[best]) best = l })
      setResult(best)
      setDone(true)
    }
  }

  if (done && result) {
    const r = doc.results[result]
    const moodDisplay = t(`mood.${r.moodKey}`)
    return (
      <div style={{ maxWidth: '430px', margin: '0 auto', padding: '3rem 1.5rem', textAlign: 'center', minHeight: '70vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <p style={{ fontSize: '13px', color: '#999', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{doc.yourMoodIs}</p>
        <h1 style={{ fontFamily: 'var(--font-fraunces), Georgia, serif', fontSize: '40px', margin: '10px 0 16px' }}>{moodDisplay}</h1>
        <p style={{ fontSize: '15px', color: '#555', lineHeight: 1.6, marginBottom: '2rem' }}>{r.blurb}</p>
        <Link href={`/browse/results?mood=${encodeURIComponent(r.moodKey)}`} style={{ textDecoration: 'none' }}>
          <div style={{ padding: '15px', background: '#0a0a0a', color: '#fff', borderRadius: '999px', fontSize: '16px', fontWeight: 600 }}>
            {doc.exploreTemplate.replace('{mood}', moodDisplay)}
          </div>
        </Link>
        <button onClick={() => { setStep(0); setCounts({ a: 0, b: 0, c: 0, d: 0, e: 0 }); setDone(false); setResult(null) }}
          style={{ marginTop: '14px', background: 'none', border: 'none', color: '#999', fontSize: '14px', cursor: 'pointer' }}>
          {doc.takeAgain}
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

      <p style={{ fontSize: '13px', color: '#999', marginBottom: '8px' }}>
        {doc.questionOf.replace('{n}', String(step + 1)).replace('{total}', String(QUESTIONS.length))}
      </p>
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