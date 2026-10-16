
import { useEffect, useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import Topbar from './Topbar'
import Sidebar from './Sidebar'
import './layout.css'

export default function AppShell() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const { pathname } = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    setIsDrawerOpen(false)
  }, [pathname])

  function handleMenuClick() {
    setIsDrawerOpen(true)
  }

  function handleDrawerClose() {
    setIsDrawerOpen(false)
  }

  function handleLogout() {
    navigate('/login', { replace: true })
  }

  return (
    <>
      <Topbar
        user={null}
        unreadNotifications={0}
        notifications={[]}
        onMenuClick={handleMenuClick}
        onLogout={handleLogout}
      />

      <div className="shell">
        <Sidebar
          open={isDrawerOpen}
          onClose={handleDrawerClose}
          badges={{}}
        />

        <main className="main">
          <Outlet />
        </main>
      </div>
    </>
  )
}
