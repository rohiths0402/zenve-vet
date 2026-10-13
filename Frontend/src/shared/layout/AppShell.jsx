import { useEffect, useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import Topbar from './Topbar'
import Sidebar from './Sidebar'
import './layout.css'

/**
 * OWNER: Pavitra. Everyone else renders inside <Outlet /> and never edits this folder.
 * The shell already adds page padding, so pages should not add their own outer padding.
 *
 * TODO wiring:
 *   - user               -> auth store (/auth/me)
 *   - badges.messages    -> unread count from features/messaging (Chandra)
 *   - unreadNotifications / notifications -> GET /notifications
 */
export default function AppShell() {
  const [drawer, setDrawer] = useState(false)
  const { pathname } = useLocation()
  const navigate = useNavigate()

  useEffect(() => { setDrawer(false) }, [pathname])

  const user = { name: 'Admin' }   // placeholder
  const badges = {}                // e.g. { messages: 3 }

  return (
    <>
      <Topbar user={user} unreadNotifications={0} notifications={[]}
        onMenuClick={() => setDrawer(true)} onLogout={() => navigate('/login')} />
      <div className="shell">
        <Sidebar open={drawer} onClose={() => setDrawer(false)} badges={badges} />
        <main className="main"><Outlet /></main>
      </div>
    </>
  )
}
