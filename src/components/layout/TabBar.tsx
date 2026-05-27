'use client'
import { Home, ShoppingCart, Heart, User, Plus } from 'lucide-react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'

export default function TabBar() {
  const pathname = usePathname()

  const tabs = [
    { href: '/browse', icon: Home, label: 'Home' },
    { href: '/shop', icon: ShoppingCart, label: 'Shop' },
    { href: '/favorites', icon: Heart, label: 'Favorites' },
    { href: '/me', icon: User, label: 'Me' },
  ]

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: '50%',
      transform: 'translateX(-50%)',
      width: '100%',
      maxWidth: '430px',
      backgroundColor: '#ffffff',
      borderTop: '1px solid #e8e8e8',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-around',
      padding: '8px 0 20px',
      zIndex: 50,
    }}>
      {tabs.slice(0, 2).map(({ href, icon: Icon, label }) => {
        const active = pathname === href
        return (
          <Link key={href} href={href} style={{ textDecoration: 'none' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
              <Icon size={22} color={active ? '#0a0a0a' : '#999999'} />
              <span style={{ fontSize: '10px', color: active ? '#0a0a0a' : '#999999', fontWeight: active ? 600 : 400 }}>{label}</span>
            </div>
          </Link>
        )
      })}

      <Link href="/dashboard/upload" style={{ textDecoration: 'none' }}>
        <div style={{
          width: '48px',
          height: '48px',
          borderRadius: '999px',
          backgroundColor: '#0a0a0a',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '8px',
        }}>
          <Plus size={22} color="#ffffff" />
        </div>
      </Link>

      {tabs.slice(2).map(({ href, icon: Icon, label }) => {
        const active = pathname === href
        return (
          <Link key={href} href={href} style={{ textDecoration: 'none' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
              <Icon size={22} color={active ? '#0a0a0a' : '#999999'} />
              <span style={{ fontSize: '10px', color: active ? '#0a0a0a' : '#999999', fontWeight: active ? 600 : 400 }}>{label}</span>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
