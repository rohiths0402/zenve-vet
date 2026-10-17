
import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, Plus, Bell } from 'lucide-react'
import './Topbar.css'

import {
  AUTH_EVENT,
  getStoredUser,
  getUserInitial,
  getProfilePicture,
} from './topbarUtils.js'

import RegistrationModal from '../../features/auth/components/RegistrationModal'
import SignInModal from '../../features/auth/components/SignInModal'
import ProfileMenu from './ProfileMenu'
import NotificationsMenu from './NotificationsMenu'

const PROFILE_PROMPT_DELAY = 30_000
const PROFILE_PROMPT_KEY = 'zenveProfilePromptShown'

export default function Topbar() {
  const navigate = useNavigate()

  const [activeAuthModal, setActiveAuthModal] = useState(null)
  const [user, setUser] = useState(() => getStoredUser())
  const [activeMenu, setActiveMenu] = useState(null)

  const timerRef = useRef(null)

  const refreshUser = useCallback(() => {
    const currentUser = getStoredUser()

    setUser(currentUser)

    if (!currentUser) {
      setActiveMenu(null)
    }
  }, [])

  useEffect(() => {
    function handleOpenProfile() {
      const storedUser = getStoredUser()
      setUser(storedUser)

      if (storedUser) {
        setActiveAuthModal(null)
        setActiveMenu('profile')
      } else {
        setActiveMenu(null)
        setActiveAuthModal('register')
      }
    }

    window.addEventListener('zenve-open-profile', handleOpenProfile)
    window.addEventListener(AUTH_EVENT, refreshUser)
    window.addEventListener('storage', refreshUser)

    return () => {
      window.removeEventListener('zenve-open-profile', handleOpenProfile)
      window.removeEventListener(AUTH_EVENT, refreshUser)
      window.removeEventListener('storage', refreshUser)
    }
  }, [refreshUser])

  // Show the profile-completion prompt once per session
  // after an authenticated user has been active for 30 seconds.
  useEffect(() => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current)
      timerRef.current = null
    }

    const accessToken = localStorage.getItem('zenveAccessToken')

    if (!user || !accessToken) return undefined

    if (sessionStorage.getItem(PROFILE_PROMPT_KEY) === 'true') {
      return undefined
    }

    timerRef.current = window.setTimeout(() => {
      const currentUser = getStoredUser()
      const currentToken = localStorage.getItem('zenveAccessToken')

      if (!currentUser || !currentToken) return

      sessionStorage.setItem(PROFILE_PROMPT_KEY, 'true')
      setActiveMenu(null)
      setActiveAuthModal(null)

      navigate('/doctors/me?completeProfile=1')
    }, PROFILE_PROMPT_DELAY)

    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current)
        timerRef.current = null
      }
    }
  }, [user, navigate])

  // Prevent background scrolling while an authentication modal is open.
  useEffect(() => {
    if (!activeAuthModal) return undefined

    const previousOverflow = document.body.style.overflow

    function handleEscape(event) {
      if (event.key === 'Escape') {
        setActiveAuthModal(null)
      }
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleEscape)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleEscape)
    }
  }, [activeAuthModal])

  function openRegistration() {
    setActiveMenu(null)
    setActiveAuthModal('register')
  }

  function openSignIn() {
    setActiveMenu(null)
    setActiveAuthModal('login')
  }

  function closeModal() {
    setActiveAuthModal(null)
  }

  function handleLogout() {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current)
      timerRef.current = null
    }

    const storageKeys = [
      'zenveAccessToken',
      'zenveRefreshToken',
      'zenveUser',
      'zenve_user',
      'user',
      'currentUser',
      'zenveProfilePhotoUrl',
    ]

    storageKeys.forEach((key) => localStorage.removeItem(key))
    sessionStorage.removeItem(PROFILE_PROMPT_KEY)

    setUser(null)
    setActiveMenu(null)
    setActiveAuthModal(null)

    window.dispatchEvent(new Event(AUTH_EVENT))

    navigate('/', { replace: true })
  }

  const profilePicture = getProfilePicture(user)

  return (
    <>
      <header className="zenve-topbar">
        <Link
          to="/"
          className="zenve-brand"
          aria-label="Zenve Vet home"
        >
          <span className="zenve-brand__mark">ZV</span>

          <span className="zenve-brand__text">
            <span className="zenve-brand__name">
              ZENVE VET<sup>™</sup>
            </span>

            <span className="zenve-brand__tagline">
              THE PROFESSIONAL NETWORK
            </span>
          </span>
        </Link>

        <label className="zenve-search">
          {/* <Search size={17} aria-hidden="true" /> */}

          {/* <input
            type="search"
            placeholder="Search doctors, specialties, cities..."
            aria-label="Search doctors, specialties, cities"
          /> */}

          {/* <span className="zenve-search__country">INDIA</span> */}
        </label>

        <div className="zenve-topbar__actions">
          <Link
            to="/messages?community=1"
            className="zenve-community"
            title="Open Community Discussions"
          >
            <span className="zenve-community__dot" />
            Open community
          </Link>

          {!user ? (
            <button
              type="button"
              className="zenve-profile-btn"
              onClick={openRegistration}
            >
              <Plus size={16} />
              Create your profile
            </button>
          ) : (
            <>
              <button
                type="button"
                className="zenve-icon-btn"
                aria-label="Notifications"
                aria-expanded={activeMenu === 'notifications'}
                onClick={() =>
                  setActiveMenu((current) =>
                    current === 'notifications'
                      ? null
                      : 'notifications'
                  )
                }
              >
                <Bell size={21} />
              </button>

              <button
                type="button"
                className="zenve-avatar"
                aria-label="Open profile menu"
                aria-expanded={activeMenu === 'profile'}
                onClick={() =>
                  setActiveMenu((current) =>
                    current === 'profile' ? null : 'profile'
                  )
                }
              >
                {profilePicture ? (
                  <img
                    src={profilePicture}
                    alt=""
                    onError={(event) => {
                      event.currentTarget.style.display = 'none'
                    }}
                  />
                ) : (
                  getUserInitial(user)
                )}
              </button>
            </>
          )}
        </div>

        {activeMenu === 'profile' && user && (
          <div className="zenve-topbar__menu">
            <ProfileMenu
              user={user}
              onClose={() => setActiveMenu(null)}
              onLogout={handleLogout}
            />
          </div>
        )}

        {activeMenu === 'notifications' && user && (
          <div className="zenve-topbar__menu zenve-topbar__menu--notifications">
            <NotificationsMenu />
          </div>
        )}
      </header>

      {activeAuthModal === 'register' && (
        <RegistrationModal
          onClose={closeModal}
          onSignIn={openSignIn}
        />
      )}

      {activeAuthModal === 'login' && (
        <SignInModal
          onClose={closeModal}
          onRegister={openRegistration}
        />
      )}
    </>
  )
}
