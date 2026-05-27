'use client'
import { Bell, ShoppingBag, Search } from 'lucide-react'

interface TopBarProps {
  unreadCount?: number
}

export default function TopBar({ unreadCount = 0 }: TopBarProps) {
  return (
    <div style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      backgroundColor: '#ffffff',
      borderBottom: '1px solid #e8e8e8',
      padding: '12px 16px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      maxWidth: '430px',
      margin: '0 auto',
    }}>
      <div style={{ position: 'relative' }}>
        <Bell size={22} color="#0a0a0a" />
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute',
            top: '-4px',
            right: '-4px',
            background: '#b94040',
            color: 'white',
            borderRadius: '999px',
            fontSize: '10px',
            width: '16px',
            height: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>{unreadCount}</span>
        )}
      </div>
      <div style={{
        flex: 1,
        backgroundColor: '#f2f2f2',
        borderRadius: '999px',
        padding: '8px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      }}>
        <Search size={16} color="#999999" />
        <input
          placeholder="Search artists, styles, mediums..."
          style={{
            background: 'transparent',
            border: 'none',
            outline: 'none',
            fontSize: '14px',
            color: '#0a0a0a',
            width: '100%',
          }}
        />
      </div>
      <ShoppingBag size={22} color="#0a0a0a" />
    </div>
  )
}
