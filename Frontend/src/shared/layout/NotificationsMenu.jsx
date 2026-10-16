import { useCallback, useEffect, useRef, useState } from 'react'
import { Bell, Check, LoaderCircle } from 'lucide-react'
import useClickOutside from '../hooks/useClickOutside'

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api'
).replace(/\/+$/, '')

async function apiRequest(path, options = {}) {
  const token = localStorage.getItem('zenveAccessToken')
  const headers = { Accept: 'application/json', ...options.headers }

  if (options.body) headers['Content-Type'] = 'application/json'
  if (token) headers.Authorization = `Bearer ${token}`

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
    credentials: 'include',
  })

  const text = await response.text()
  let data = null

  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      data = text
    }
  }

  if (!response.ok) {
    const message =
      typeof data === 'object' && data !== null
        ? data.detail || data.message || JSON.stringify(data)
        : data || `Request failed (${response.status})`

    throw new Error(`${message} [HTTP ${response.status}]`)
  }

  return data
}

function getNotificationList(data) {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.results)) return data.results
  if (Array.isArray(data?.notifications)) return data.notifications
  return []
}

function getNotificationText(notification) {
  if (notification.message) return notification.message
  if (notification.text) return notification.text
  if (notification.title) return notification.title

  const actor =
    notification.actor_full_name ||
    notification.actor_username ||
    notification.actor?.fullName ||
    notification.actor?.username

  const messages = {
    CONNECTION_REQUEST: 'sent you a connection request',
    CONNECTION_ACCEPTED: 'accepted your connection request',
    NEW_MESSAGE: 'sent you a message',
  }

  const description =
    messages[notification.type] || 'sent you a notification'

  return actor ? `${actor} ${description}` : description
}

function isRead(notification) {
  return Boolean(
    notification.read ??
    notification.is_read ??
    notification.read_at
  )
}

function formatTime(value) {
  if (!value) return ''

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''

  return date.toLocaleString([], {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

export default function NotificationsMenu() {
  const [open, setOpen] = useState(true)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [markingId, setMarkingId] = useState(null)
  const ref = useRef(null)

  useClickOutside(ref, () => setOpen(false), open)

  const fetchNotifications = useCallback(async () => {
    const token = localStorage.getItem('zenveAccessToken')

    if (!token) {
      setNotifications([])
      setUnreadCount(0)
      setError('Please sign in to view notifications.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const [listData, countData] = await Promise.all([
        apiRequest('/notifications/'),
        apiRequest('/notifications/unread-count/'),
      ])

      const items = getNotificationList(listData)

      setNotifications(
        items.map((item) => ({
          ...item,
          text: getNotificationText(item),
          read: isRead(item),
          time: formatTime(
            item.created_at || item.createdAt || item.timestamp
          ),
        }))
      )

      const count =
        typeof countData === 'number'
          ? countData
          : countData?.unread_count ??
            countData?.unreadCount ??
            countData?.count ??
            0

      setUnreadCount(Number(count) || 0)
    } catch (err) {
      setError(err.message || 'Unable to load notifications.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (open) fetchNotifications()
  }, [open, fetchNotifications])

  async function markAsRead(notification) {
    if (notification.read || markingId !== null) return

    setMarkingId(notification.id)
    setError('')

    try {
      await apiRequest(`/notifications/${notification.id}/read/`, {
        method: 'POST',
      })

      setNotifications((current) =>
        current.map((item) =>
          item.id === notification.id ? { ...item, read: true } : item
        )
      )

      setUnreadCount((count) => Math.max(0, count - 1))
    } catch (err) {
      setError(err.message || 'Unable to mark notification as read.')
    } finally {
      setMarkingId(null)
    }
  }

  async function markAllAsRead() {
    if (unreadCount === 0 || markingId !== null) return

    setMarkingId('all')
    setError('')

    try {
      await apiRequest('/notifications/read-all/', {
        method: 'POST',
      })

      setNotifications((current) =>
        current.map((item) => ({ ...item, read: true }))
      )
      setUnreadCount(0)
    } catch (err) {
      setError(err.message || 'Unable to mark notifications as read.')
    } finally {
      setMarkingId(null)
    }
  }

  return (
    <div className="dropdown-wrap" ref={ref}>
      <button
        type="button"
        className="icon-btn"
        aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ''}`}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <Bell size={22} strokeWidth={1.75} />
        {unreadCount > 0 && <span className="bell-dot" />}
      </button>

      {open && (
        <div className="dropdown">
          <div className="dropdown__title">
            <span>Notifications{unreadCount > 0 ? ` (${unreadCount})` : ''}</span>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                disabled={markingId !== null}
                title="Mark all notifications as read"
              >
                Mark all read
              </button>
            )}
          </div>

          {error && <p role="alert">{error}</p>}

          {loading ? (
            <p className="dropdown__empty">
              <LoaderCircle size={16} /> Loading notifications...
            </p>
          ) : notifications.length === 0 ? (
            <p className="dropdown__empty">
              {error ? 'Notifications could not be loaded.' : "You're all caught up."}
            </p>
          ) : (
            <ul className="dropdown__list">
              {notifications.map((notification) => (
                <li
                  key={notification.id}
                  className={notification.read ? '' : 'unread'}
                >
                  <div>{notification.text}</div>

                  {notification.time && (
                    <small>{notification.time}</small>
                  )}

                  {!notification.read && (
                    <button
                      type="button"
                      onClick={() => markAsRead(notification)}
                      disabled={markingId !== null}
                      aria-label="Mark notification as read"
                      title="Mark as read"
                    >
                      <Check size={15} />
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}