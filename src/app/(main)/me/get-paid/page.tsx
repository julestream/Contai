import Link from 'next/link'

export default function GetPaidPage() {
  return (
    <div style={{ maxWidth: '430px', margin: '0 auto', paddingBottom: '6rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '1.5rem 1rem 1rem' }}>
        <Link href="/me" style={{ textDecoration: 'none', color: '#0a0a0a', fontSize: '20px' }}>←</Link>
        <h1 style={{ fontFamily: 'var(--font-fraunces), Georgia, serif', fontSize: '24px' }}>Get paid</h1>
      </div>

      <div style={{ padding: '0.5rem 1.25rem' }}>
        <p style={{ fontSize: '15px', color: '#333', lineHeight: 1.6, marginBottom: '1.25rem' }}>
          Here's how getting paid works on Contai today.
        </p>

        <div style={{ padding: '1rem 0', borderBottom: '1px solid #eee' }}>
          <p style={{ fontSize: '15px', fontWeight: 600, color: '#0a0a0a', marginBottom: '6px' }}>The buyer reserves online</p>
          <p style={{ fontSize: '14px', color: '#666', lineHeight: 1.6 }}>
            When a buyer reserves your work, they pay an 8% reservation fee through Contai. This secures the piece and shows they're serious.
          </p>
        </div>

        <div style={{ padding: '1rem 0', borderBottom: '1px solid #eee' }}>
          <p style={{ fontSize: '15px', fontWeight: 600, color: '#0a0a0a', marginBottom: '6px' }}>You meet in person</p>
          <p style={{ fontSize: '14px', color: '#666', lineHeight: 1.6 }}>
            You arrange to meet the buyer to hand over the artwork. They see the piece in person before completing the purchase.
          </p>
        </div>

        <div style={{ padding: '1rem 0', borderBottom: '1px solid #eee' }}>
          <p style={{ fontSize: '15px', fontWeight: 600, color: '#0a0a0a', marginBottom: '6px' }}>The buyer pays you directly</p>
          <p style={{ fontSize: '14px', color: '#666', lineHeight: 1.6 }}>
            At the meeting, the buyer pays you the remaining amount directly. You keep the full sale price minus the reservation fee already collected.
          </p>
        </div>

        <div style={{ marginTop: '1.5rem', padding: '16px', borderRadius: '12px', background: '#f5f3ef' }}>
          <p style={{ fontSize: '14px', color: '#555', lineHeight: 1.6 }}>
            Online payouts and shipping are coming in a future update, so buyers further away can purchase and have work delivered. We'll let you know when it's ready.
          </p>
        </div>

        <p style={{ fontSize: '13px', color: '#999', lineHeight: 1.6, marginTop: '1.25rem' }}>
          Note: as a seller you are responsible for your own taxes on sales. If you have questions, contact us at hello@contaigallery.com.
        </p>
      </div>
    </div>
  )
}