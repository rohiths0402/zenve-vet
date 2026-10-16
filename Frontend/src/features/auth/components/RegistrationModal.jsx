import { useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, CheckCircle2, X } from 'lucide-react'
import './registration.css'
import { useRegistration } from '../hooks/useRegistration'

const initialForm = {
  name: '',
  email: '',
  username: '',
  password: '',
  confirmPassword: '',
  specialty: 'Small Animal Medicine',
  about: '',
}

const validEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())

const passwordRules = (password) => [
  { label: 'At least 8 characters', valid: password.length >= 8 },
  { label: 'Uppercase letter', valid: /[A-Z]/.test(password) },
  { label: 'Lowercase letter', valid: /[a-z]/.test(password) },
  { label: 'Number', valid: /\d/.test(password) },
  { label: 'Special character', valid: /[^A-Za-z0-9]/.test(password) },
]

export default function RegistrationModal({ onClose, onSignIn }) {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState(initialForm)
  const [touched, setTouched] = useState({})
  const [errors, setErrors] = useState({})
  const [usernameStatus, setUsernameStatus] = useState('')
  const [checkingUsername, setCheckingUsername] = useState(false)
  const [message, setMessage] = useState('')

  const navigate = useNavigate()

  const {
    register,
    checkUsername,
    isSubmitting,
    error: registrationError,
  } = useRegistration()

  const rules = passwordRules(form.password)
  const strongPassword = rules.every((rule) => rule.valid)

  const passwordsMatch =
    form.confirmPassword.length > 0 &&
    form.password === form.confirmPassword

  const emailError = !form.email.trim()
    ? 'Professional email is required.'
    : !validEmail(form.email)
      ? 'Enter a valid email address.'
      : ''

  function updateField(event) {
    const { name, value } = event.target

    setForm((current) => ({ ...current, [name]: value }))
    setTouched((current) => ({ ...current, [name]: true }))
    setErrors((current) => ({ ...current, [name]: '' }))
    setMessage('')

    if (name === 'username') {
      setUsernameStatus('')
    }
  }

  async function handleCheckUsername() {
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(form.username)) {
      setTouched((current) => ({ ...current, username: true }))
      setErrors((current) => ({
        ...current,
        username: 'Use 3–20 letters, numbers or underscores.',
      }))
      return
    }

    setCheckingUsername(true)
    setUsernameStatus('')
    setMessage('')

    try {
      const result = await checkUsername(form.username.trim())
      const available = result?.available === true

      setUsernameStatus(available ? 'available' : 'taken')

      setErrors((current) => ({
        ...current,
        username: available ? '' : 'This username is already taken.',
      }))
    } catch (err) {
      setMessage(
        err.message || 'Could not check username availability.'
      )
    } finally {
      setCheckingUsername(false)
    }
  }

  function handleContinue(event) {
    event.preventDefault()

    const nextErrors = {}

    if (form.name.trim().length < 2) {
      nextErrors.name = 'Enter your full name.'
    }

    if (emailError) {
      nextErrors.email = emailError
    }

    if (!/^[a-zA-Z0-9_]{3,20}$/.test(form.username)) {
      nextErrors.username =
        'Use 3–20 letters, numbers or underscores.'
    } else if (usernameStatus !== 'available') {
      nextErrors.username =
        'Check username availability first.'
    }

    if (!strongPassword) {
      nextErrors.password =
        'Your password does not meet all requirements.'
    }

    if (!passwordsMatch) {
      nextErrors.confirmPassword = 'Passwords do not match.'
    }

    setTouched({
      name: true,
      email: true,
      username: true,
      password: true,
      confirmPassword: true,
    })

    setErrors(nextErrors)

    if (Object.keys(nextErrors).length === 0) {
      setStep(2)
      setMessage('')
    }
  }

  async function handleCreateProfile(event) {
    event.preventDefault()

    const nextErrors = {}

    if (!form.specialty.trim()) {
      nextErrors.specialty = 'Choose your specialty.'
    }

    if (form.about.length > 500) {
      nextErrors.about = 'Maximum 500 characters.'
    }

    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) return

    setMessage('')

    try {
      await register({
        name: form.name.trim(),
        email: form.email.trim(),
        username: form.username.trim(),
        password: form.password,
        specialty: form.specialty,
        about: form.about.trim(),
      })
      onClose?.()
      navigate('/', { replace: true })
    } catch (err) {
      setMessage(err.message || 'Could not create your account.')
    }
  }

  const usernameInvalid =
    touched.username && Boolean(errors.username)

  return createPortal(
    <div
      className="profile-modal-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose?.()
      }}
    >
      <section
        className="profile-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="registration-title"
      >
        <button
          className="profile-modal__close"
          type="button"
          onClick={onClose}
          aria-label="Close"
        >
          <X size={21} />
        </button>

        <div className="profile-modal__progress">
          <span className={step === 1 ? 'is-active' : 'is-complete'}>
            {step === 2 ? <CheckCircle2 size={14} /> : '1'} Account
          </span>

          <span className="profile-modal__progress-line" />

          <span className={step === 2 ? 'is-active' : ''}>
            2 Profile
          </span>
        </div>

        <h2
          id="registration-title"
          className="profile-modal__title"
        >
          {step === 1
            ? 'Create your professional account.'
            : 'Make your professional mark.'}
        </h2>

        <p className="profile-modal__intro">
          {step === 1
            ? 'Set up your account to join the Zenve Vet community.'
            : 'Tell the veterinary community about your expertise.'}
        </p>

        {step === 1 ? (
          <form onSubmit={handleContinue} noValidate>
            <label className="profile-modal__field">
              <span className="profile-modal__label">
                Full name
              </span>

              <input
                className={`profile-modal__input ${
                  touched.name && form.name.trim().length < 2
                    ? 'is-invalid'
                    : ''
                }`}
                name="name"
                autoComplete="name"
                value={form.name}
                onChange={updateField}
                placeholder="Enter your full name"
              />

              {touched.name && form.name.trim().length < 2 && (
                <small className="profile-modal__error">
                  Enter your full name.
                </small>
              )}
            </label>

            <label className="profile-modal__field">
              <span className="profile-modal__label">
                Professional email
              </span>

              <input
                className={`profile-modal__input ${
                  touched.email && emailError ? 'is-invalid' : ''
                }`}
                type="email"
                name="email"
                autoComplete="email"
                value={form.email}
                onChange={updateField}
                onBlur={() =>
                  setTouched((current) => ({
                    ...current,
                    email: true,
                  }))
                }
                placeholder="you@example.com"
              />

              {touched.email && emailError && (
                <small className="profile-modal__error">
                  {emailError}
                </small>
              )}

              {touched.email && form.email && !emailError && (
                <small className="profile-modal__success">
                  Email format looks valid.
                </small>
              )}
            </label>

            <label className="profile-modal__field">
              <span className="profile-modal__label">
                Username
              </span>

              <div className="profile-modal__username-row">
                <input
                  className={`profile-modal__input ${
                    usernameInvalid ? 'is-invalid' : ''
                  }`}
                  name="username"
                  autoComplete="username"
                  value={form.username}
                  onChange={updateField}
                  onBlur={() =>
                    setTouched((current) => ({
                      ...current,
                      username: true,
                    }))
                  }
                  placeholder="e.g. dr_ananya"
                  minLength={3}
                  maxLength={20}
                />

                <button
                  className="profile-modal__secondary"
                  type="button"
                  onClick={handleCheckUsername}
                  disabled={checkingUsername || !form.username}
                >
                  {checkingUsername ? 'Checking…' : 'Check'}
                </button>
              </div>

              {usernameStatus === 'available' && (
                <small className="profile-modal__success">
                  Username is available.
                </small>
              )}

              {usernameInvalid && (
                <small className="profile-modal__error">
                  {errors.username}
                </small>
              )}
            </label>

            <label className="profile-modal__field">
              <span className="profile-modal__label">
                Password
              </span>

              <input
                className={`profile-modal__input ${
                  touched.password &&
                  form.password &&
                  !strongPassword
                    ? 'is-invalid'
                    : ''
                }`}
                type="password"
                name="password"
                autoComplete="new-password"
                value={form.password}
                onChange={updateField}
                onBlur={() =>
                  setTouched((current) => ({
                    ...current,
                    password: true,
                  }))
                }
                placeholder="Create a strong password"
              />

              <div className="profile-modal__password-checks">
                {rules.map((rule) => (
                  <span
                    key={rule.label}
                    className={rule.valid ? 'is-valid' : ''}
                  >
                    {rule.valid ? '✓' : '○'} {rule.label}
                  </span>
                ))}
              </div>
            </label>

            <label className="profile-modal__field">
              <span className="profile-modal__label">
                Confirm password
              </span>

              <input
                className={`profile-modal__input ${
                  touched.confirmPassword &&
                  form.confirmPassword &&
                  !passwordsMatch
                    ? 'is-invalid'
                    : ''
                }`}
                type="password"
                name="confirmPassword"
                autoComplete="new-password"
                value={form.confirmPassword}
                onChange={updateField}
                onBlur={() =>
                  setTouched((current) => ({
                    ...current,
                    confirmPassword: true,
                  }))
                }
                placeholder="Re-enter your password"
              />

              {touched.confirmPassword &&
                form.confirmPassword && (
                  <small
                    className={
                      passwordsMatch
                        ? 'profile-modal__success'
                        : 'profile-modal__error'
                    }
                  >
                    {passwordsMatch
                      ? 'Passwords match.'
                      : 'Passwords do not match.'}
                  </small>
                )}
            </label>

            {message && (
              <p className="profile-modal__message" role="alert">
                {message}
              </p>
            )}

            {registrationError && (
              <p className="profile-modal__error" role="alert">
                {registrationError}
              </p>
            )}

            <button
              className="profile-modal__submit"
              type="submit"
            >
              Continue <ArrowRight size={16} />
            </button>
          </form>
        ) : (
          <form onSubmit={handleCreateProfile} noValidate>
            <label className="profile-modal__field">
              <span className="profile-modal__label">
                Specialty
              </span>

              <select
                className="profile-modal__input"
                name="specialty"
                value={form.specialty}
                onChange={updateField}
              >
                <option>Small Animal Medicine</option>
                <option>Large Animal Medicine</option>
                <option>Surgery</option>
                <option>Veterinary Dentistry</option>
                <option>Veterinary Dermatology</option>
                <option>Veterinary Cardiology</option>
                <option>Emergency and Critical Care</option>
                <option>Exotic Animal Medicine</option>
                <option>Veterinary Pathology</option>
                <option>Other</option>
              </select>
            </label>

            <label className="profile-modal__field">
              <span className="profile-modal__label">
                About you
              </span>

              <textarea
                className="profile-modal__textarea"
                name="about"
                value={form.about}
                onChange={updateField}
                placeholder="Share your experience and areas of expertise..."
                maxLength={500}
                rows={5}
              />

              <small className="profile-modal__counter">
                {form.about.length}/500
              </small>
            </label>

            {message && (
              <p className="profile-modal__message" role="alert">
                {message}
              </p>
            )}

            <div className="profile-modal__button-row">
              <button
                type="button"
                className="profile-modal__back"
                onClick={() => setStep(1)}
              >
                <ArrowLeft size={15} /> Back
              </button>

              <button
                className="profile-modal__submit"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? 'Creating…'
                  : 'Create my professional page'}

                {!isSubmitting && <ArrowRight size={16} />}
              </button>
            </div>
          </form>
        )}

        <p className="profile-modal__footer">
          Already have an account?{' '}

          <button
            type="button"
            className="profile-modal__sign-in"
            onClick={onSignIn}
          >
            Sign in
          </button>
        </p>
      </section>
    </div>,
    document.body
  )
}
