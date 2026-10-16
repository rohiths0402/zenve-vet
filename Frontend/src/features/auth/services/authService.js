const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  'http://127.0.0.1:8000/api'
).replace(/\/+$/, '')

const AUTH_STORAGE_KEY = 'zenveUser'
const AUTH_EVENT = 'zenve-auth-changed'

async function apiRequest(path, { method = 'GET', body, token } = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      Accept: 'application/json',
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    const detail = data.detail ||
      Object.entries(data)
        .map(([key, value]) =>
          `${key}: ${Array.isArray(value) ? value.join(', ') : value}`
        )
        .join('\n')

    throw new Error(detail || `Request failed (${response.status})`)
  }

  return data
}

function saveSession(data) {
  if (!data?.access || !data?.refresh || !data?.user) {
    throw new Error('Login succeeded without the required session data.')
  }

  const user = data.user

  const safeUser = {
    id: user.id ?? user.pk ?? null,
    username: user.username ?? '',
    full_name: user.fullName ?? user.full_name ?? user.name ?? '',
    email: user.email ?? '',
    profile_picture: user.profile_picture ?? user.profilePicture ?? '',
  }

  localStorage.setItem('zenveAccessToken', data.access)
  localStorage.setItem('zenveRefreshToken', data.refresh)
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(safeUser))

  window.dispatchEvent(new Event(AUTH_EVENT))
}

export async function registerAccount(formData) {
  const payload = {
    email: formData.email.trim(),
    fullName: (formData.fullName ?? formData.name ?? '').trim(),
    username: formData.username.trim(),
    password: formData.password,
    city: (formData.city ?? '').trim(),
    state: (formData.state ?? '').trim(),
    specialty: (formData.specialty ?? '').trim(),
    bio: (formData.bio ?? formData.about ?? '').trim(),
  }

  // First create the account and doctor profile.
  const registration = await apiRequest('/accounts/register/', {
    method: 'POST',
    body: payload,
  })

  // Then obtain JWT tokens using the new account.
  try {
    const login = await apiRequest('/accounts/login/', {
      method: 'POST',
      body: {
        identifier: payload.email,
        password: payload.password,
      },
    })

    saveSession(login)

    return {
      ...registration,
      ...login,
    }
  } catch {
    // Registration may have succeeded even if automatic login failed.
    throw new Error(
      'Your account was created, but automatic login failed. Please sign in.'
    )
  }
}

export async function signInAccount({ email, identifier, password }) {
  const data = await apiRequest('/accounts/login/', {
    method: 'POST',
    body: {
      identifier: (identifier ?? email ?? '').trim(),
      password,
    },
  })

  saveSession(data)
  return data
}

export async function checkUsernameAvailability(username) {
  const query = new URLSearchParams({
    username: username.trim(),
  })

  return apiRequest(
    `/accounts/usernameAvailability/?${query.toString()}`
  )
}

export async function getCurrentUser() {
  const token = localStorage.getItem('zenveAccessToken')

  if (!token) {
    throw new Error('Please sign in first.')
  }

  return apiRequest('/accounts/me/', { token })
}

export function clearAuthenticatedUser() {
  localStorage.removeItem('zenveUser')
  localStorage.removeItem('zenveAccessToken')
  localStorage.removeItem('zenveRefreshToken')

  window.dispatchEvent(new Event(AUTH_EVENT))
}