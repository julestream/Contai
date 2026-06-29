'use client'

import Link from 'next/link'
import { useLang } from '@/i18n/LanguageProvider'
import LanguageSwitcher from '@/components/ui/LanguageSwitcher'
import { Heart } from 'lucide-react'

const SURVEY_URL = 'https://www.surveymonkey.com/share/157adc36-e6a1-4bed-b17a-b3eb702dd9cd'

const COPY: Record<string, { title: string; body: string; cta: string; note: string }> = {
  hu: {
    title: 'Köszönjük, hogy itt vagy',
    body: 'A Contai még egészen friss, és te az elsők között próbálod ki. Ez rengeteget jelent nekünk. Az őszinte véleményed segít a legtöbbet abban, hogy a Contai jobb legyen — minden gondolatod, ötleted és észrevételed számít.',
    cta: 'Töltsd ki a kérdőívet',
    note: 'Csak néhány percet vesz igénybe, és óriási segítség.',
  },
  en: {
    title: 'Thank you for being here',
    body: 'Contai is brand new, and you\'re among the very first to try it. That means the world to us. Your honest feedback helps more than anything to make Contai better — every thought, idea, and observation counts.',
    cta: 'Take the questionnaire',
    note: 'It only takes a few minutes, and it\'s a huge help.',
  },
  ro: {
    title: 'Îți mulțumim că ești aici',
    body: 'Contai este complet nou, iar tu ești printre primii care îl încearcă. Înseamnă enorm pentru noi. Părerea ta sinceră ne ajută cel mai mult să facem Contai mai bun — fiecare gând, idee și observație contează.',
    cta: 'Completează chestionarul',
    note: 'Durează doar câteva minute și este un ajutor uriaș.',
  },
}

export default function NewsPage() {
  const { lang } = useLang()
  const c = COPY[lang] || COPY.hu

  return (
    <div style={{ maxWidth: '430px', margin: '0 auto', paddingBottom: '6rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1rem 0.5rem' }}>
        <Link href="/home" style={{ textDecoration: 'none', color: '#0a0a0a', fontSize: '20px' }}>←</Link>
        <LanguageSwitcher />
      </div>

      <div style={{ padding: '2rem 1.5rem', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.25rem' }}>
          <div style={{
            width: '60px', height: '60px', borderRadius: '999px', background: '#2b3c66',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Heart size={28} color="#f2ebe2" fill="#f2ebe2" />
          </div>
        </div>

        <h1 style={{ fontFamily: 'var(--font-fraunces), Georgia, serif', fontSize: '26px', color: '#0a0a0a' }}>{c.title}</h1>
        <p style={{ fontSize: '15px', color: '#444', lineHeight: 1.7, marginTop: '1rem', textAlign: 'left' }}>{c.body}</p>

        <a href={SURVEY_URL} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
          <div style={{
            marginTop: '2rem', padding: '16px', borderRadius: '999px',
            background: '#1c2b3a', color: '#f2ebe2', fontSize: '16px', fontWeight: 600,
          }}>
            {c.cta}
          </div>
        </a>
        <p style={{ fontSize: '13px', color: '#999', marginTop: '12px' }}>{c.note}</p>
      </div>
    </div>
  )
}