'use client'

import LanguageSwitcher from '@/components/ui/LanguageSwitcher'

// The auth pages sit outside (main), so they never had the app's language
// switcher. That left a Romanian visitor arriving at a signup link with no
// way out of Hungarian — the fix required the very navigation they couldn't
// read. Pinning it to the top corner solves it before anything else is asked
// of them.
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      <div style={{
        position: 'absolute',
        top: '14px',
        right: '14px',
        zIndex: 10,
      }}>
        <LanguageSwitcher />
      </div>
      {children}
    </div>
  )
}