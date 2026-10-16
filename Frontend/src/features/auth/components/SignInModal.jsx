import { useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { ArrowUpRight, X } from 'lucide-react'
import './registration.css'
import { useSignIn } from '../hooks/useSignIn'

const validEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())

export default function SignInModal({ onClose, onRegister }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [touched, setTouched] = useState({})
  const [submittedError, setSubmittedError] = useState('')

  const navigate = useNavigate()
  const { signIn, isSubmitting, error } = useSignIn()

  const emailError = !email.trim()
    ? 'Professional email is required.'
    : !validEmail(email)
      ? 'Enter a valid email address.'
      : ''

  const passwordError = !password
    ? 'Password is required.'
    : ''

  async function handleSubmit(event) {
    event.preventDefault()

    setTouched({ email: true, password: true })
    setSubmittedError('')

    if (emailError || passwordError) return

    try {
      await signIn({
        email: email.trim(),
        password,
      })

      // Login succeeded: close the modal and redirect Home.
      onClose?.()
      navigate('/', { replace: true })
    } catch (err) {
      setSubmittedError(
        err?.message || 'Incorrect email or password.'
      )
    }
  }

  return createPortal(
    <div
      className="profile-modal-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose?.()
        }
      }}
    >
      <section
        className="profile-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="signin-title"
      >
        <button
          type="button"
          className="profile-modal__close"
          onClick={onClose}
          aria-label="Close sign in"
        >
          <X size={21} />
        </button>

        <h2
          id="signin-title"
          className="profile-modal__title"
        >
          Welcome back.
        </h2>

        <p className="profile-modal__intro">
          Sign in to access your professional page.
        </p>

        <form onSubmit={handleSubmit} noValidate>
          <label className="profile-modal__field">
            <span className="profile-modal__label">
              Professional email
            </span>

            <input
              className={`profile-modal__input ${
                touched.email && emailError
                  ? 'is-invalid'
                  : ''
              }`}
              type="email"
              name="email"
              autoComplete="username"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value)
                setSubmittedError('')
              }}
              onBlur={() =>
                setTouched((current) => ({
                  ...current,
                  email: true,
                }))
              }
              placeholder="you@example.com"
              required
            />

            {touched.email && emailError && (
              <small className="profile-modal__error">
                {emailError}
              </small>
            )}
          </label>

          <label className="profile-modal__field">
            <span className="profile-modal__label">
              Password
            </span>

            <input
              className={`profile-modal__input ${
                touched.password && passwordError
                  ? 'is-invalid'
                  : ''
              } ${submittedError || error ? 'is-invalid' : ''}`}
              type="password"
              name="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value)
                setSubmittedError('')
              }}
              onBlur={() =>
                setTouched((current) => ({
                  ...current,
                  password: true,
                }))
              }
              placeholder="Enter your password"
              required
            />

            {touched.password && passwordError && (
              <small className="profile-modal__error">
                {passwordError}
              </small>
            )}
          </label>

          {(submittedError || error) && (
            <p
              className="profile-modal__server-error"
              role="alert"
            >
              {submittedError || error}
            </p>
          )}

          <button
            className="profile-modal__submit"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Signing in…' : 'Sign in'}

            {!isSubmitting && <ArrowUpRight size={17} />}
          </button>
        </form>

        <p className="profile-modal__footer">
          New to Zenve Vet?{' '}

          <button
            type="button"
            className="profile-modal__sign-in"
            onClick={onRegister}
          >
            Create your professional page
          </button>
        </p>
      </section>
    </div>,
    document.body
  )
}
