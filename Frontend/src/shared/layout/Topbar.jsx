import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Menu, Search } from 'lucide-react'
import Logo from './Logo'
import NotificationsMenu from './NotificationsMenu'
import ProfileMenu from './ProfileMenu'

/**
 * Props: user {name, avatarUrl?}, region, unreadNotifications, notifications,
 *        onMenuClick (opens mobile sidebar), onLogout
 */
export default function Topbar({
  user, region = 'India', unreadNotifications = 0, notifications = [], onMenuClick, onLogout,
}) {
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  const submit = (e) => {
    e.preventDefault()
    const q = query.trim()
    navigate(q ? `/search?q=${encodeURIComponent(q)}` : '/search')
  }

  return (
    <header className="topbar">
      <div className="topbar__left">
        <button type="button" className="icon-btn menu-btn" aria-label="Open navigation" onClick={onMenuClick}>
          <Menu size={22} strokeWidth={1.75} />
        </button>
        <div className="topbar__logo"><Logo /></div>
      </div>

      <form className="search" role="search" onSubmit={submit}>
        <Search size={20} strokeWidth={1.75} aria-hidden="true" />
        <input type="search" value={query} onChange={(e) => setQuery(e.target.value)}
          placeholder="Search doctors, specialties, cities…" aria-label="Search doctors, specialties, cities" />
        <span className="search__region">{region}</span>
      </form>

      <div className="topbar__right">
        <Link to="/network" className="community">
          <span className="community__dot" /> Open community
        </Link>
        <NotificationsMenu unreadCount={unreadNotifications} notifications={notifications} />
        <ProfileMenu user={user} onLogout={onLogout} />
      </div>
    </header>
  )
}
