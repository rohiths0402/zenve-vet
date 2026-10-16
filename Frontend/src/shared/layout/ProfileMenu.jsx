
import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { LogOut, UserRound } from 'lucide-react'
import useClickOutside from '../hooks/useClickOutside'
import {
  getUserInitial,
  getProfilePicture,
} from './topbarUtils.js'

export default function ProfileMenu({ user, onClose, onLogout }) {
  const ref = useRef(null)

  useClickOutside(ref, onClose, true)

  const displayName =
    user?.full_name ||
    user?.fullName ||
    user?.name ||
    user?.username ||
    user?.email ||
    'My account'

  const profilePicture = getProfilePicture(user)
  const initial = getUserInitial(user)

  return (
    <div className="dropdown-wrap" ref={ref}>
      <div className="dropdown" role="menu">
        <div className="dropdown__title">
          <strong>{displayName}</strong>
          {user?.email && <div>{user.email}</div>}
        </div>

        <Link
          to="/doctors/me"
          className="dropdown__item"
          role="menuitem"
          onClick={onClose}
        >
          <UserRound size={18} strokeWidth={1.75} />
          View profile
        </Link>

        <button
          type="button"
          className="dropdown__item"
          role="menuitem"
          onClick={onLogout}
        >
          <LogOut size={18} strokeWidth={1.75} />
          Sign out
        </button>
      </div>
    </div>
  )
}
