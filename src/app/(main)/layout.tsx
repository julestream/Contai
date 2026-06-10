import TabBar from '@/components/layout/TabBar'
import TopBar from '@/components/layout/TopBar'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh' }}>
      <TopBar />
      <div style={{ paddingBottom: 90 }}>{children}</div>
      <TabBar />
    </div>
  )
}
