import Logo from '@/components/ui/Logo'
import Link from 'next/link'
import { Hammer } from 'lucide-react'

export default function ComingSoon({ title, blurb }: { title: string; blurb?: string }) {
  return (
    <div style={{
      maxWidth: '430px', margin: '0 auto', minHeight: '80vh',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      textAlign: 'center', padding: '2rem 1.5rem',
    }}>
      <Logo size={0.85} />

      <div style={{
        marginTop: '2.5rem', width: '56px', height: '56px', borderRadius: '999px',
        background: '#f5f3ef', display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Hammer size={26} color="#9c5a3c" strokeWidth={1.8} />
      </div>

      <h1 style={{ fontFamily: 'var(--font-fraunces), Georgia, serif', fontSize: '26px', marginTop: '1.5rem' }}>{title}</h1>
      <p style={{ fontSize: '12px', color: '#999', letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: '8px' }}>Coming soon</p>

      {blurb && <p style={{ fontSize: '15px', color: '#666', lineHeight: 1.6, marginTop: '1rem', maxWidth: '320px' }}>{blurb}</p>}

      <Link href="/home" style={{ textDecoration: 'none', marginTop: '2.5rem' }}>
        <div style={{ padding: '13px 28px', border: '1px solid #0a0a0a', borderRadius: '999px', fontSize: '15px', color: '#0a0a0a' }}>
          Back to Discover
        </div>
      </Link>
    </div>
  )
}