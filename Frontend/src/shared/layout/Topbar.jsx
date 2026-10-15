import { useCallback, useEffect, useState } from 'react'
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

export default function Topbar() {
  const [activeAuthModal, setActiveAuthModal] = useState(null)
  const [user, setUser] = useState(() => getStoredUser())
  const [activeMenu, setActiveMenu] = useState(null)

  const refreshUser = useCallback(() => {
    setUser(getStoredUser())
  }, [])

  useEffect(() => {
    function handleOpenProfile() {
      if (user) {
        setActiveMenu('profile')
      } else {
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
  }, [user, refreshUser])

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
    // Frontend state only. Connect the actual logout service
    // when your authentication implementation is available.
    localStorage.removeItem('zenveUser')
    setUser(null)
    setActiveMenu(null)

    window.dispatchEvent(new Event(AUTH_EVENT))
  }

  const profilePicture = getProfilePicture(user)

  return (
    <>
      <header className="zenve-topbar">
        <a href="/" className="zenve-brand" aria-label="Zenve Vet home">
          <span className="zenve-brand__mark">ZV</span>

          <span className="zenve-brand__text">
            <span className="zenve-brand__name">
              ZENVE VET<sup>™</sup>
            </span>

            <span className="zenve-brand__tagline">
              THE PROFESSIONAL NETWORK
            </span>
          </span>
        </a>

        <label className="zenve-search">
          <Search size={17} aria-hidden="true" />

          <input
            type="search"
            placeholder="Search doctors, specialties, cities..."
            aria-label="Search doctors, specialties, cities"
          />

          <span className="zenve-search__country">INDIA</span>
        </label>

        <div className="zenve-topbar__actions">
          <span className="zenve-community">
            <span className="zenve-community__dot" />
            Open community
          </span>

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
            <NotificationsMenu
              onClose={() => setActiveMenu(null)}
            />
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
