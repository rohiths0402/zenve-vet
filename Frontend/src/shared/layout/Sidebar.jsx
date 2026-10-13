import { NavLink } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { NAV_PRIMARY, NAV_DISCOVER } from './navConfig'

/** Props: open (mobile drawer), onClose, badges { [navKey]: number } e.g. { messages: 3 } */
export default function Sidebar({ open = false, onClose, badges = {} }) {
  const linkClass = ({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')

  return (
    <>
      {open && <div className="overlay" onClick={onClose} aria-hidden="true" />}

      <aside className={open ? 'sidebar sidebar--open' : 'sidebar'} aria-label="Primary">
        <p className="sidebar__label">Your professional world</p>
        <p className="sidebar__title">Great minds.<br />Healthier tomorrows.</p>

        <nav className="nav" aria-label="Main">
          {NAV_PRIMARY.map(({ key, label, to, icon: Icon, end }) => (
            <NavLink key={key} to={to} end={end} className={linkClass} onClick={onClose}>
              {({ isActive }) => (
                <>
                  <Icon size={22} strokeWidth={1.75} aria-hidden="true" />
                  <span>{label}</span>
                  {badges[key] > 0
                    ? <span className="nav-badge">{badges[key] > 99 ? '99+' : badges[key]}</span>
                    : isActive ? <span className="nav-dot" /> : null}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="discover">
          <p className="sidebar__label">Discover &amp; grow</p>
          <nav className="nav" aria-label="Discover and grow">
            {NAV_DISCOVER.map(({ key, label, to, icon: Icon }) => (
              <NavLink key={key} to={to} className={linkClass} onClick={onClose}>
                <Icon size={20} strokeWidth={1.75} aria-hidden="true" />
                <span>{label}</span>
                <ArrowUpRight size={16} strokeWidth={1.75} className="nav-arrow" aria-hidden="true" />
              </NavLink>
            ))}
          </nav>
        </div>
      </aside>
    </>
  )
}
