import { useRef, useState } from 'react'
import { Bell } from 'lucide-react'
import useClickOutside from '../hooks/useClickOutside'

/** Bell + dropdown. Props: unreadCount, notifications [{id, text, time, read}], onOpen */
export default function NotificationsMenu({ unreadCount = 0, notifications = [], onOpen }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  useClickOutside(ref, () => setOpen(false), open)

  return (
    <div className="dropdown-wrap" ref={ref}>
      <button type="button" className="icon-btn" aria-label="Notifications" aria-expanded={open}
        onClick={() => { setOpen((v) => !v); if (!open) onOpen?.() }}>
        <Bell size={22} strokeWidth={1.75} />
        {unreadCount > 0 && <span className="bell-dot" />}
      </button>

      {open && (
        <div className="dropdown">
          <p className="dropdown__title">Notifications</p>
          {notifications.length === 0 ? (
            <p className="dropdown__empty">You're all caught up.</p>
          ) : (
            <ul className="dropdown__list">
              {notifications.map((n) => (
                <li key={n.id} className={n.read ? '' : 'unread'}>{n.text}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
