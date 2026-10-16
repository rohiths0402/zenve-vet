import { AUTH_STORAGE_KEY } from '../../../shared/layout/topbarUtils.js'
  
const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  'http://127.0.0.1:8000/api'
).replace(/\/$/, '')

const API_BASE = `${API_BASE_URL}/messaging`

const ENDPOINTS = {
  CONVERSATIONS: `${API_BASE}/conversations/`,
  MESSAGES: (conversationId) =>
    `${API_BASE}/conversations/${conversationId}/messages/`,
  READ: (conversationId) =>
    `${API_BASE}/conversations/${conversationId}/read/`,
  UNREAD_COUNT: `${API_BASE}/messages/unread-count/`,
}

const META_KEY = 'zenvet_thread_meta'
const PRESENCE_KEY = 'zenvet_presence'

export const DEFAULT_META = {
  starred: false,
  muted: false,
  archived: false,
  blocked: false,
  reported: false,
  unread: 0,
}

const read = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

const write = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value))
}

// Read Aarthi's authenticated user, not Soodan's separate profile.
export const getProfile = () => {
  const user = read(AUTH_STORAGE_KEY, null)

  if (!user?.id) return null

  return {
    id: String(user.id),
    name:
      user.full_name ||
      user.fullName ||
      user.username ||
      user.email ||
      'User',
    avatar:
      user.profile_picture ||
      user.profilePicture ||
      user.avatar ||
      null,
  }
}

export const getPresence = () => read(PRESENCE_KEY, {})

// A failed API request must not silently become a successful local operation.
async function request(url, options = {}) {
  let response

  try {
    response = await fetch(url, {
      ...options,
      credentials: 'include',
      headers: {
        Accept: 'application/json',
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...options.headers,
      },
    })
  } catch {
    throw new Error(
      'Cannot connect to the messaging server. Check that the backend is running.'
    )
  }

  if (response.status === 204) return null

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      throw new Error(
        'Your session is not authorized. Please sign in again.'
      )
    }

    throw new Error(
      data.detail ||
        data.message ||
        data.error ||
        `Messaging request failed (${response.status}).`
    )
  }

  return data
}

const getRows = (data) => {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.results)) return data.results
  if (Array.isArray(data?.data)) return data.data

  return []
}

const getMeta = (id) => ({
  ...DEFAULT_META,
  ...(read(META_KEY, {})[id] || {}),
})

const patchMeta = (id, changes) => {
  const all = read(META_KEY, {})
  all[id] = {
    ...DEFAULT_META,
    ...(all[id] || {}),
    ...changes,
  }

  write(META_KEY, all)
  return all[id]
}

// GET conversations
export async function getConversations() {
  const data = await request(ENDPOINTS.CONVERSATIONS)

  return getRows(data).map((conversation) => {
    const other = conversation.otherUser || conversation.other_user || {}
    const conversationId = String(conversation.id)
    const doctorId = String(other.id ?? '')

    return {
      id: conversationId,
      doctor: {
        id: doctorId,
        conversationId,
        name:
          other.fullName ||
          other.full_name ||
          other.username ||
          'Doctor',
        specialty: other.specialty || 'Veterinarian',
        city: other.city || '',
        state: other.state || '',
        avatar: other.avatarUrl || other.avatar_url || null,
      },
      last: (conversation.lastMessage || conversation.last_message)
        ? {
            id: (conversation.lastMessage || conversation.last_message).id,
            text:
              (conversation.lastMessage || conversation.last_message).body ||
              '',
            createdAt:
              (conversation.lastMessage || conversation.last_message).createdAt ||
              (conversation.lastMessage || conversation.last_message).created_at,
          }
        : null,
      meta: {
        ...getMeta(conversationId),
        unread:
          conversation.unreadCount ??
          conversation.unread_count ??
          0,
      },
    }
  })
}

// GET messages for a conversation
export async function getMessages(conversationId) {
  const data = await request(ENDPOINTS.MESSAGES(conversationId))
  const profile = getProfile()

  return getRows(data).map((message) => {
    const senderId = message.sender?.id ?? message.sender
    const createdAt = message.createdAt ?? message.created_at

    return {
      id: message.id,
      from:
        String(senderId) === String(profile?.id) ? 'me' : 'them',
      text: message.body ?? message.text ?? '',
      status:
        message.status === 'seen' ? 'read' : message.status,
      createdAt,
    }
  })
}

// POST message
export async function sendMessage(
  conversationId,
  { text, attachment }
) {
  if (attachment) {
    throw new Error(
      'Attachments are not connected to the messaging API yet.'
    )
  }

  const data = await request(ENDPOINTS.MESSAGES(conversationId), {
    method: 'POST',
    body: JSON.stringify({ body: text }),
  })

  const message = data?.data ?? data

  return {
    id: message.id,
    from: 'me',
    text: message.body ?? message.text ?? text,
    status:
      message.status === 'seen' ? 'read' : message.status || 'sent',
    createdAt: message.createdAt ?? message.created_at,
  }
}

// Mark conversation as read; keep local metadata for UI state.
export async function setThreadMeta(conversationId, changes) {
  if (changes.unread === 0) {
    await request(ENDPOINTS.READ(conversationId), {
      method: 'POST',
    })
  }

  return patchMeta(conversationId, changes)
}

// Delete conversation
export async function deleteConversation(conversationId) {
  await request(`${API_BASE}/conversations/${conversationId}/`, {
    method: 'DELETE',
  })

  const all = read(META_KEY, {})
  delete all[conversationId]
  write(META_KEY, all)
}

// Attachment conversion only; upload support is not implemented here.
export const prepareAttachment = (file) =>
  new Promise((resolve, reject) => {
    const isImage = file.type.startsWith('image/')
    const limit = isImage ? 1024 * 1024 : 1536 * 1024

    if (file.size > limit) {
      reject(
        new Error(
          `File too large. Limit is ${isImage ? '1 MB' : '1.5 MB'}`
        )
      )
      return
    }

    const reader = new FileReader()

    reader.onload = () =>
      resolve({
        type: isImage ? 'image' : 'file',
        name: file.name,
        size: file.size,
        mime: file.type,
        url: reader.result,
      })

    reader.onerror = () => reject(new Error('Could not read the file.'))
    reader.readAsDataURL(file)
  })
