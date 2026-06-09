import TabBar from '@/components/layout/TabBar'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh' }}>
      <div style={{ paddingBottom: 90 }}>{children}</div>
      <TabBar />
    </div>
  )
}
