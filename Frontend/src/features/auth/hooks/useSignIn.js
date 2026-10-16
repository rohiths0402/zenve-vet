import { useState } from 'react'
import { signInAccount } from '../services/authService'

export function useSignIn() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function signIn(credentials) {
    setIsSubmitting(true)
    setError('')

    try {
      return await signInAccount(credentials)
    } catch (err) {
      const message =
        err.status === 400 || err.status === 401
          ? 'Incorrect email or password.'
          : err.message || 'Unable to sign in. Please try again.'

      setError(message)
      throw new Error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    signIn,
    isSubmitting,
    error,
  }
}

export default useSignIn