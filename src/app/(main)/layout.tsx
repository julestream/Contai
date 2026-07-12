import TabBar from '@/components/layout/TabBar'
import TopBar from '@/components/layout/TopBar'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#ece8e1',
    }}>
      <div style={{
        maxWidth: 480,
        margin: '0 auto',
        minHeight: '100vh',
        background: '#ffffff',
        boxShadow: '0 0 40px rgba(0,0,0,0.06)',
        position: 'relative',
      }}>
        <TopBar />
        <div style={{ paddingBottom: 90 }}>{children}</div>
        <TabBar />
      </div>
    </div>
  )
}