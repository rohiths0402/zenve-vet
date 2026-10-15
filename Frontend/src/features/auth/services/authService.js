import {
  AUTH_EVENT,
  AUTH_STORAGE_KEY,
} from '../../../shared/layout/topbarUtils.js'

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  'http://127.0.0.1:8000/api'
).replace(/\/$/, '')

async function request(path, body) {
  let response

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(body),
    })
  } catch {
    const error = new Error(
      'Cannot connect to the server. Check whether the Django backend is running.'
    )
    error.status = 0
    throw error
  }

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    let message

    if (
      path.endsWith('/login/') &&
      [400, 401].includes(response.status)
    ) {
      message = 'Incorrect email or password.'
    } else {
      message =
        data.detail ||
        data.message ||
        data.error ||
        'The request failed. Please try again.'
    }

    const error = new Error(message)
    error.status = response.status
    error.data = data
    throw error
  }

  return data
}

// Extract the user from common response formats.
// Confirm the actual format returned by your Django API.
function extractUser(data) {
  return (
    data?.user ||
    data?.data?.user ||
    data?.data ||
    null
  )
}

function saveAuthenticatedUser(data) {
  const user = extractUser(data)

  if (!user || typeof user !== 'object') {
    return
  }

  const safeUser = {
    id: user.id ?? user.pk ?? null,
    username: user.username ?? '',
    full_name: user.full_name ?? user.fullName ?? user.name ?? '',
    email: user.email ?? '',
    profile_picture:
      user.profile_picture ??
      user.profilePicture ??
      user.avatar_url ??
      user.avatar ??
      null,
  }

  localStorage.setItem(
    AUTH_STORAGE_KEY,
    JSON.stringify(safeUser)
  )

  window.dispatchEvent(new Event(AUTH_EVENT))
}

// Registration API
export async function registerAccount(formData) {
  const { confirmPassword, ...payload } = formData

  const data = await request('/auth/register/', payload)

  // Registration does not automatically mean the user is logged in.
  // Update the Topbar only if the response contains an authenticated user.
  if (
    data?.authenticated === true ||
    data?.is_authenticated === true
  ) {
    saveAuthenticatedUser(data)
  }

  return data
}

// Username availability API
export function checkUsernameAvailability(username) {
  return request('/auth/check-username/', { username })
}

// Sign-in API
export async function signInAccount({ email, password }) {
  const data = await request('/auth/login/', {
    email: email.trim(),
    password,
  })

  saveAuthenticatedUser(data)

  return data
}

// Frontend logout helper.
// Call this alongside your actual backend logout endpoint if required.
export function clearAuthenticatedUser() {
  localStorage.removeItem(AUTH_STORAGE_KEY)
  window.dispatchEvent(new Event(AUTH_EVENT))
}
