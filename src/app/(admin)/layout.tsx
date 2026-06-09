import AdminBar from '@/components/layout/AdminBar'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh' }}>
      <AdminBar />
      {children}
    </div>
  )
}
