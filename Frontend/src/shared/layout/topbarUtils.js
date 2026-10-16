export const AUTH_STORAGE_KEY = 'zenveUser'
export const AUTH_EVENT = 'zenve-auth-changed'

export function getStoredUser() {
  try {
    const storedUser = localStorage.getItem(AUTH_STORAGE_KEY)

    if (!storedUser) return null

    const parsedUser = JSON.parse(storedUser)

    return parsedUser && typeof parsedUser === 'object'
      ? parsedUser
      : null
  } catch {
    return null
  }
}

export function getUserInitial(user) {
  const name =
    user?.username ||
    user?.full_name ||
    user?.fullName ||
    user?.name ||
    user?.email ||
    ''

  return String(name).trim().charAt(0).toUpperCase() || 'U'
}

export function getProfilePicture(user) {
  return (
    user?.profilePicture ||
    user?.profile_picture ||
    user?.avatar ||
    user?.avatar_url ||
    user?.profile_image ||
    null
  )
}
