import TabBar from '@/components/layout/TabBar'
import TopBar from '@/components/layout/TopBar'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-field">
      <div className="app-shell">
        <TopBar />
        <div className="app-body">{children}</div>
        {/* Below 900px the tab bar is the navigation; above it, the top
            bar carries everything and this is hidden by CSS. */}
        <div className="mobile-only">
          <TabBar />
        </div>
      </div>
    </div>
  )
}