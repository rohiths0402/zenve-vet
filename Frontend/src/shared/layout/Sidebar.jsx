
import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Compass,
  Users,
  BriefcaseMedical,
  Video,
  MessageCircle,
  Search,
  Award,
  Megaphone,
  Lightbulb,
  Stethoscope,
  ArrowUpRight,
  Sparkles,
  X,
} from 'lucide-react';

const primaryLinks = [
  { label: 'Feed', to: '/', icon: Compass, end: true },
  { label: 'Vet network', to: '/network', icon: Users },
  { label: 'Clinical cases', to: '/clinical-cases', icon: BriefcaseMedical },
  { label: 'Short videos', to: '/reels', icon: Video },
  { label: 'Messages', to: '/messages', icon: MessageCircle },
  { label: 'Search', to: '/search', icon: Search },
  { label: 'Member benefits', to: '/benefits', icon: Award },
  { label: 'Advertise', to: '/advertise', icon: Megaphone },
];

const discoverLinks = [
  {
    label: 'Innovation & scholarships',
    to: '/benefits',
    icon: Lightbulb,
  },
  {
    label: 'Expert mentorship',
    to: '/mentorship',
    icon: Stethoscope,
  },
];

const sidebarStyles = `
  .zv-sidebar {
    position: fixed;
    top: 104px;
    left: 0;
    bottom: 0;
    z-index: 130;
    display: flex;
    flex-direction: column;
    width: 250px;
    padding: 22px 15px 16px;
    box-sizing: border-box;
    overflow-y: auto;
    overflow-x: hidden;
    overscroll-behavior-y: contain;
    -webkit-overflow-scrolling: touch;
    scroll-behavior: smooth;
    scrollbar-width: none;
    -ms-overflow-style: none;
    scrollbar-color: #d1d9d0 transparent;
    border-right: 1px solid #e8e9e2;
    background: #fdfdfb;
    color: #56645b;
    box-shadow: 4px 0 18px rgb(24 48 34 / 3%);
    font-family: Arial, sans-serif;
  }

  .zv-sidebar::-webkit-scrollbar {
    width: 5px;
  }

  .zv-sidebar::-webkit-scrollbar-track {
    background: transparent;
  }

  .zv-sidebar::-webkit-scrollbar-thumb {
    background: #d1d9d0;
    border-radius: 10px;
  }

  .zv-sidebar::-webkit-scrollbar-thumb:hover {
    background: #aebdaf;
  }

  .zv-sidebar__intro {
    flex-shrink: 0;
    padding: 0 8px;
    margin-bottom: 18px;
  }

  .zv-sidebar__eyebrow,
  .zv-sidebar__discover-title {
    color: #9b783d;
    font-size: 8px;
    font-weight: 700;
    letter-spacing: 1.45px;
    line-height: 1.6;
    text-transform: uppercase;
  }

  .zv-sidebar__eyebrow {
    margin: 0 0 8px;
  }

  .zv-sidebar__heading {
    margin: 0;
    color: #183c2d;
    font-size: 17px;
    font-weight: 500;
    letter-spacing: -.35px;
    line-height: 1.35;
  }

  .zv-sidebar__nav {
    display: flex;
    flex-direction: column;
    gap: 3px;
  }

  .zv-sidebar__link {
    display: flex;
    align-items: center;
    gap: 11px;
    width: 100%;
    min-height: 38px;
    padding: 8px 10px;
    box-sizing: border-box;
    border: 1px solid transparent;
    border-radius: 6px;
    color: #59675d;
    font-size: 11.5px;
    line-height: 1.4;
    text-decoration: none;
    transition:
      background-color 180ms ease,
      color 180ms ease,
      border-color 180ms ease;
  }

  .zv-sidebar__link > svg {
    flex-shrink: 0;
    width: 18px;
    height: 18px;
    color: #687a6d;
    transition: color 180ms ease;
  }

  .zv-sidebar__link:hover {
    background: #f0f4ee;
    color: #174b35;
  }

  .zv-sidebar__link:hover > svg {
    color: #176344;
  }

  .zv-sidebar__link.is-active {
    background: #e8f0e8;
    border-color: #e1eade;
    color: #075b3a;
    font-weight: 600;
    box-shadow: inset 2px 0 0 #176344;
  }

  .zv-sidebar__link.is-active > svg {
    color: #075b3a;
  }

  .zv-sidebar__label {
    flex: 1;
    min-width: 0;
  }

  .zv-sidebar__dot {
    width: 6px;
    height: 6px;
    flex-shrink: 0;
    border-radius: 50%;
    background: #168451;
  }

  .zv-sidebar__badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 17px;
    height: 17px;
    padding: 0 5px;
    box-sizing: border-box;
    border-radius: 20px;
    background: #075b3a;
    color: #fff;
    font-size: 9px;
  }

  .zv-sidebar__discover {
    flex-shrink: 0;
    margin-top: 18px;
    padding-top: 16px;
    border-top: 1px solid #e8e9e2;
  }

  .zv-sidebar__discover-title {
    margin: 0 8px 10px;
    color: #8a7955;
    font-size: 8px;
    letter-spacing: 1.5px;
  }

  .zv-sidebar__arrow {
    flex-shrink: 0;
    margin-left: auto;
  }

  .zv-sidebar__promo {
    flex-shrink: 0;
    margin-top: 18px;
    padding: 17px 14px 14px;
    border: 1px solid #eadfc4;
    border-radius: 8px;
    background: linear-gradient(145deg, #fbf6e9, #f5edd8);
  }

  .zv-sidebar__promo-icon {
    width: 19px;
    height: 19px;
    margin-bottom: 10px;
    color: #a18443;
  }

  .zv-sidebar__promo-heading {
    margin: 0 0 8px;
    color: #18392c;
    font-size: 16px;
    font-weight: 500;
    letter-spacing: -.2px;
    line-height: 1.4;
  }

  .zv-sidebar__promo-text {
    margin: 0 0 13px;
    color: #687267;
    font-size: 11px;
    line-height: 1.65;
  }

  .zv-sidebar__promo-button {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    width: 100%;
    min-height: 35px;
    padding: 8px 9px;
    border: 1px solid #d4c092;
    border-radius: 5px;
    background: transparent;
    color: #28372d;
    font-family: inherit;
    font-size: 10.5px;
    text-align: left;
    cursor: pointer;
    transition: background-color 180ms ease;
  }

  .zv-sidebar__promo-button:hover {
    background: #eee1bf;
  }

  .zv-sidebar__footer {
    flex-shrink: 0;
    margin-top: 17px;
    padding-top: 12px;
    border-top: 1px solid #ecece6;
    color: #899087;
    font-size: 9px;
    line-height: 1.7;
  }

  .zv-sidebar__mobile-close,
  .zv-sidebar__overlay {
    display: none;
  }

  .zv-sidebar__link:focus-visible,
  .zv-sidebar__promo-button:focus-visible {
    outline: 2px solid #176344;
    outline-offset: 2px;
  }

  .zv-free-page-overlay {
    position: fixed;
    inset: 104px 0 0 280px;
    z-index: 500;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
    box-sizing: border-box;
    background: rgba(20, 30, 24, .42);
  }

  .zv-free-page-popup {
    position: relative;
    width: 100%;
    max-width: 480px;
    max-height: 100%;
    overflow-y: auto;
    overscroll-behavior: contain;
    padding: 30px;
    box-sizing: border-box;
    border: 1px solid #e1e2da;
    border-radius: 8px;
    background: #fff;
    color: #56645b;
    box-shadow: 0 16px 48px rgba(20, 30, 24, .18);
    font-family: Arial, sans-serif;
  }

  .zv-free-page-close {
    position: absolute;
    top: 12px;
    right: 12px;
    display: grid;
    place-items: center;
    width: 32px;
    height: 32px;
    border: 0;
    border-radius: 4px;
    background: transparent;
    color: #56645b;
    cursor: pointer;
  }

  .zv-free-page-close:hover {
    background: #f3f4ef;
  }

  .zv-free-page-icon {
    margin-bottom: 14px;
    color: #a18443;
  }

  .zv-free-page-title {
    margin: 0 35px 8px 0;
    color: #151c18;
    font-size: 24px;
    font-weight: 500;
    line-height: 1.35;
  }

  .zv-free-page-description {
    margin: 0 0 22px;
    color: #687267;
    font-size: 13px;
    line-height: 1.7;
  }

  .zv-free-page-form {
    display: flex;
    flex-direction: column;
    gap: 15px;
  }

  .zv-free-page-field {
    display: flex;
    flex-direction: column;
    gap: 7px;
  }

  .zv-free-page-field label {
    color: #28372d;
    font-size: 12px;
    font-weight: 600;
  }

  .zv-free-page-field input,
  .zv-free-page-field textarea {
    width: 100%;
    padding: 11px 12px;
    box-sizing: border-box;
    border: 1px solid #d9ded6;
    border-radius: 5px;
    outline: none;
    background: #fff;
    color: #28372d;
    font-family: inherit;
    font-size: 13px;
  }

  .zv-free-page-field input:focus,
  .zv-free-page-field textarea:focus {
    border-color: #075b3a;
    box-shadow: 0 0 0 3px rgb(7 91 58 / 8%);
  }

  .zv-free-page-field textarea {
    min-height: 85px;
    resize: vertical;
  }

  .zv-free-page-submit {
    width: 100%;
    min-height: 42px;
    margin-top: 3px;
    padding: 11px 16px;
    border: 1px solid #075b3a;
    border-radius: 5px;
    background: #075b3a;
    color: #fff;
    font-family: inherit;
    font-size: 13px;
    cursor: pointer;
  }

  .zv-free-page-submit:hover {
    background: #06492f;
  }

  .zv-free-page-success {
    padding: 12px;
    border: 1px solid #c9dfce;
    border-radius: 5px;
    background: #edf7ef;
    color: #075b3a;
    font-size: 13px;
    line-height: 1.6;
  }

  @media (max-width: 760px) {
    .zv-sidebar {
      top: 0;
      bottom: 0;
      width: min(280px, 86vw);
      padding: 48px 15px 18px;
      transform: translateX(-105%);
      transition: transform 260ms cubic-bezier(.22, 1, .36, 1);
      z-index: 400;
    }

    .zv-sidebar.is-open {
      transform: translateX(0);
    }

    .zv-sidebar__mobile-close {
      position: absolute;
      top: 10px;
      right: 12px;
      display: grid;
      place-items: center;
      width: 30px;
      height: 30px;
      border: 0;
      border-radius: 4px;
      background: transparent;
      color: #56645b;
      cursor: pointer;
    }

    .zv-sidebar__mobile-close:hover {
      background: #f0f4ee;
    }

    .zv-sidebar__overlay.is-visible {
      position: fixed;
      inset: 0;
      display: block;
      background: rgba(20, 30, 24, .36);
      z-index: 399;
    }

    .zv-free-page-overlay {
      inset: 76px 0 0;
      padding: 16px;
    }

    .zv-free-page-popup {
      padding: 25px 20px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .zv-sidebar,
    .zv-sidebar__link,
    .zv-sidebar__link > svg,
    .zv-sidebar__promo-button {
      scroll-behavior: auto;
      transition: none;
    }
  }
`;

export default function Sidebar({
  open = false,
  onClose = () => {},
  badges = {},
}) {
  const [showFreePagePopup, setShowFreePagePopup] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function closePopup() {
    setShowFreePagePopup(false);
    setSubmitted(false);
  }

  useEffect(() => {
    if (!open && !showFreePagePopup) return undefined;

    function handleEscape(event) {
      if (event.key === 'Escape') {
        closePopup();
        onClose();
      }
    }

    window.addEventListener('keydown', handleEscape);

    return () => {
      window.removeEventListener('keydown', handleEscape);
    };
  }, [open, showFreePagePopup, onClose]);

  const handleFreePageSubmit = (event) => {
    event.preventDefault();
    // Frontend demonstration only: no data is sent or saved.
    setSubmitted(true);
  };

  return (
    <>
      <style>{sidebarStyles}</style>

      <div
        className={`zv-sidebar__overlay ${open ? 'is-visible' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        id="zenve-sidebar"
        className={`zv-sidebar ${open ? 'is-open' : ''}`}
        aria-label="Primary navigation"
      >
        <button
          type="button"
          className="zv-sidebar__mobile-close"
          onClick={onClose}
          aria-label="Close sidebar"
        >
          <X size={18} />
        </button>

        <div className="zv-sidebar__intro">
          <p className="zv-sidebar__eyebrow">
            Your professional world
          </p>

          <h2 className="zv-sidebar__heading">
            Great minds.
            <br />
            Healthier tomorrows.
          </h2>
        </div>

        <nav className="zv-sidebar__nav" aria-label="Main menu">
          {primaryLinks.map(({ label, to, icon: Icon, end }) => (
            <NavLink
              key={label}
              to={to}
              end={end}
              className={({ isActive }) =>
                `zv-sidebar__link ${isActive ? 'is-active' : ''}`
              }
              onClick={onClose}
            >
              {({ isActive }) => (
                <>
                  <Icon size={18} strokeWidth={1.7} />

                  <span className="zv-sidebar__label">
                    {label}
                  </span>

                  {Number(badges[label]) > 0 ? (
                    <span className="zv-sidebar__badge">
                      {Number(badges[label]) > 99
                        ? '99+'
                        : badges[label]}
                    </span>
                  ) : isActive ? (
                    <span className="zv-sidebar__dot" />
                  ) : null}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <section className="zv-sidebar__discover">
          <p className="zv-sidebar__discover-title">
            Discover more
          </p>

          <nav className="zv-sidebar__nav" aria-label="Discover">
            {discoverLinks.map(({ label, to, icon: Icon }) => (
              <NavLink
                key={label}
                to={to}
                className={({ isActive }) =>
                  `zv-sidebar__link ${isActive ? 'is-active' : ''}`
                }
                onClick={onClose}
              >
                <Icon size={18} strokeWidth={1.7} />

                <span className="zv-sidebar__label">
                  {label}
                </span>

                <ArrowUpRight
                  className="zv-sidebar__arrow"
                  size={14}
                />
              </NavLink>
            ))}
          </nav>
        </section>

        <section className="zv-sidebar__promo">
          <Sparkles
            className="zv-sidebar__promo-icon"
            size={19}
          />

          <h3 className="zv-sidebar__promo-heading">
            Build your professional presence.
          </h3>

          <p className="zv-sidebar__promo-text">
            Create a page to showcase your clinic, expertise, and services.
          </p>

          <button
            type="button"
            className="zv-sidebar__promo-button"
            onClick={() => setShowFreePagePopup(true)}
          >
            Create your free page
            <ArrowUpRight size={15} />
          </button>
        </section>

        <footer className="zv-sidebar__footer">
          ZENVE VET
          <br />
          The professional network
        </footer>
      </aside>

      {showFreePagePopup && (
        <div
          className="zv-free-page-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closePopup();
            }
          }}
        >
          <section
            className="zv-free-page-popup"
            role="dialog"
            aria-modal="true"
            aria-labelledby="zv-free-page-title"
          >
            <button
              type="button"
              className="zv-free-page-close"
              onClick={closePopup}
              aria-label="Close form"
            >
              <X size={19} />
            </button>

            <Sparkles
              className="zv-free-page-icon"
              size={25}
            />

            <h2
              id="zv-free-page-title"
              className="zv-free-page-title"
            >
              Create your professional page
            </h2>

            <p className="zv-free-page-description">
              Introduce your clinic or professional practice to the Zenve Vet
              community.
            </p>

            {submitted ? (
              <div className="zv-free-page-success" role="status">
                Demo submitted successfully. No data has been sent or saved.

                <button
                  type="button"
                  className="zv-free-page-submit"
                  onClick={closePopup}
                  style={{ marginTop: 12 }}
                >
                  Close
                </button>
              </div>
            ) : (
              <form
                className="zv-free-page-form"
                onSubmit={handleFreePageSubmit}
              >
                <div className="zv-free-page-field">
                  <label htmlFor="zv-page-name">
                    Full name
                  </label>
                  <input
                    id="zv-page-name"
                    name="fullName"
                    type="text"
                    autoComplete="name"
                    placeholder="Your full name"
                    required
                  />
                </div>

                <div className="zv-free-page-field">
                  <label htmlFor="zv-page-email">
                    Email address
                  </label>
                  <input
                    id="zv-page-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    required
                  />
                </div>

                <div className="zv-free-page-field">
                  <label htmlFor="zv-page-title">
                    Professional title / clinic
                  </label>
                  <input
                    id="zv-page-title"
                    name="professionalTitle"
                    type="text"
                    placeholder="Veterinarian, clinic, or organization"
                    required
                  />
                </div>

                <div className="zv-free-page-field">
                  <label htmlFor="zv-page-about">
                    About your practice
                  </label>
                  <textarea
                    id="zv-page-about"
                    name="about"
                    placeholder="Briefly describe your work or services"
                  />
                </div>

                <button
                  type="submit"
                  className="zv-free-page-submit"
                >
                  Preview submission
                </button>
              </form>
            )}
          </section>
        </div>
      )}
    </>
  );
}
