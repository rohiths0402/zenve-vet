
import { useCallback, useEffect, useState } from 'react'

const AUTH_EVENT = 'zenve-auth-changed'
const TOKEN_KEY = 'zenveAccessToken'

function readAuthState() {
  return Boolean(localStorage.getItem(TOKEN_KEY))
}

export default function useAuthSession() {
  const [isAuthenticated, setIsAuthenticated] = useState(readAuthState)

  const syncAuth = useCallback(() => {
    setIsAuthenticated(readAuthState())
  }, [])

  useEffect(() => {
    window.addEventListener(AUTH_EVENT, syncAuth)
    window.addEventListener('storage', syncAuth)

    return () => {
      window.removeEventListener(AUTH_EVENT, syncAuth)
      window.removeEventListener('storage', syncAuth)
    }
  }, [syncAuth])

  return isAuthenticated
}
