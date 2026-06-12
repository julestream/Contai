'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const TYPES = ['Painting', 'Print', 'Photography', 'Graphic Art', 'Sculpture']
const MOODS = ['Joy', 'Harmony', 'Self-reflection', 'Inspiration', 'Intrigue']
const COLOURS = [
  { name: 'Black', hex: '#0a0a0a' }, { name: 'White', hex: '#ffffff' }, { name: 'Grey', hex: '#9ca3af' },
  { name: 'Beige', hex: '#e7dcc8' }, { name: 'Brown', hex: '#8b5e34' }, { name: 'Red', hex: '#dc2626' },
  { name: 'Orange', hex: '#ea580c' }, { name: 'Yellow', hex: '#eab308' }, { name: 'Green', hex: '#16a34a' },
  { name: 'Teal', hex: '#0d9488' }, { name: 'Blue', hex: '#2563eb' }, { name: 'Navy', hex: '#1e293b' },
  { name: 'Purple', hex: '#7c3aed' }, { name: 'Pink', hex: '#ec4899' }, { name: 'Gold', hex: '#c8a24a' },
  { name: 'Silver', hex: '#c0c5cc' },
]

export default function WelcomePage() {
  const router = useRouter()
  const [types, setTypes] = useState<string[]>([])
  const [colours, setColours] = useState<string[]>([])
  const [moods, setMoods] = useState<string[]>([])
  const [saving, setSaving] = useState(false)

  function toggle(list: string[], setList: (v: string[]) => void, val: string) {
    setList(list.includes(val) ? list.filter(x => x !== val) : [...list, val])
  }

  async function save(skip = false) {
    setSaving(true)
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (session && !skip) {
      await supabase.from('profiles').update({
        preferred_types: types,
        preferred_colours: colours,
        preferred_moods: moods,
      }).eq('id', session.user.id)
    }
    router.push('/home')
  }

  const chip = (active: boolean): React.CSSProperties => ({
    padding: '8px 16px', borderRadius: '999px',
    border: active ? '2px solid #0a0a0a' : '1px solid #e0dcd3',
    background: active ? '#0a0a0a' : '#ffffff',
    color: active ? '#ffffff' : '#0a0a0a',
    cursor: 'pointer', fontSize: '14px',
  })

  return (
    <div style={{ maxWidth: '430px', margin: '0 auto', padding: '2rem 1.5rem 3rem' }}>
      <h1 style={{ fontSize: '26px', marginBottom: '6px' }}>What do you love?</h1>
      <p style={{ color: '#8a857c', fontSize: '14px', marginBottom: '2rem' }}>
        Pick a few favourites so we can show you art you'll love. You can change these anytime.
      </p>

      <section style={{ marginBottom: '2rem' }}>
        <p style={{ fontWeight: 600, marginBottom: '10px' }}>Art types</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {TYPES.map(t => <button key={t} onClick={() => toggle(types, setTypes, t)} style={chip(types.includes(t))}>{t}</button>)}
        </div>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <p style={{ fontWeight: 600, marginBottom: '10px' }}>Colours</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          {COLOURS.map(c => {
            const active = colours.includes(c.name)
            return (
              <button key={c.name} onClick={() => toggle(colours, setColours, c.name)} title={c.name}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', background: 'none', border: 'none', cursor: 'pointer' }}>
                <span style={{ width: '34px', height: '34px', borderRadius: '999px', backgroundColor: c.hex, border: active ? '3px solid #0a0a0a' : '1px solid #d8d4cc' }} />
                <span style={{ fontSize: '10px', color: active ? '#0a0a0a' : '#999' }}>{c.name}</span>
              </button>
            )
          })}
        </div>
      </section>

      <section style={{ marginBottom: '2.5rem' }}>
        <p style={{ fontWeight: 600, marginBottom: '4px' }}>Moods <span style={{ color: '#bbb', fontWeight: 400 }}>(optional)</span></p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
          {MOODS.map(m => <button key={m} onClick={() => toggle(moods, setMoods, m)} style={chip(moods.includes(m))}>{m}</button>)}
        </div>
      </section>

      <button onClick={() => save(false)} disabled={saving} style={{
        width: '100%', padding: '15px', borderRadius: '999px', border: 'none',
        background: '#0a0a0a', color: '#ffffff', fontSize: '16px', fontWeight: 600,
        cursor: 'pointer', opacity: saving ? 0.6 : 1,
      }}>
        {saving ? 'Saving…' : 'Continue'}
      </button>
      <button onClick={() => save(true)} disabled={saving} style={{
        width: '100%', padding: '12px', marginTop: '10px', border: 'none',
        background: 'transparent', color: '#8a857c', fontSize: '14px', cursor: 'pointer',
      }}>
        Skip for now
      </button>
    </div>
  )
}