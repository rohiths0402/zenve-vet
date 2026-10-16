import { useState } from 'react'
import {
  registerAccount,
  checkUsernameAvailability,
} from '../services/authService'

export function useRegistration() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function checkUsername(username) {
    setError('')

    try {
      return await checkUsernameAvailability(username)
    } catch (err) {
      setError(err.message || 'Unable to check username.')
      throw err
    }
  }

  async function register(formData) {
    setIsSubmitting(true)
    setError('')

    try {
      return await registerAccount(formData)
    } catch (err) {
      setError(err.message || 'Registration failed.')
      throw err
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    register,
    checkUsername,
    isSubmitting,
    error,
  }
}

export default useRegistration