import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { LogOut, UserRound } from 'lucide-react'
import useClickOutside from '../hooks/useClickOutside'

/** Avatar button + menu. Props: user {name, avatarUrl?}, onLogout */
export default function ProfileMenu({ user, onLogout }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  useClickOutside(ref, () => setOpen(false), open)
  const initial = (user?.name || '?').trim().charAt(0).toUpperCase()

  return (
    <div className="dropdown-wrap" ref={ref}>
      <button type="button" className="avatar-btn" aria-label="Open profile menu" aria-expanded={open}
        onClick={() => setOpen((v) => !v)}>
        {user?.avatarUrl ? <img src={user.avatarUrl} alt="" /> : initial}
      </button>

      {open && (
        <div className="dropdown" role="menu">
          <p className="dropdown__title">{user?.name}</p>
          <Link to="/doctors/me" className="dropdown__item" role="menuitem" onClick={() => setOpen(false)}>
            <UserRound size={18} strokeWidth={1.75} /> View profile
          </Link>
          <button type="button" className="dropdown__item" role="menuitem"
            onClick={() => { setOpen(false); onLogout?.() }}>
            <LogOut size={18} strokeWidth={1.75} /> Sign out
          </button>
        </div>
      )}
    </div>
  )
}
