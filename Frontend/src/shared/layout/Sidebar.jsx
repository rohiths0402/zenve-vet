import { useState } from 'react';
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
  { label: 'Short videos', to: '/short-videos', icon: Video },
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


export default function Sidebar({
  open = false,
  onClose,
  badges = {},
}) {
  const [showFreePagePopup, setShowFreePagePopup] = useState(false);

  const closePopup = () => setShowFreePagePopup(false);

  return (
    <>
      <style>{`
        .zv-sidebar {
          position: fixed;
          top: 104px;
          left: 0;
          bottom: 0;
          width: 280px;
          padding: 35px 20px 18px;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          overflow-y: auto;
          overflow-x: hidden;
          background: #fff;
          border-right: 1px solid #e1e2da;
          color: #56645b;
          font-family: Arial, sans-serif;
          z-index: 150;
          scrollbar-width: thin;
          scrollbar-color: #deded5 transparent;
        }

        .zv-sidebar__intro {
          padding: 0 4px;
          margin-bottom: 28px;
        }

        .zv-sidebar__eyebrow {
          margin: 0 0 18px;
          color: #81724d;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 2px;
          text-transform: uppercase;
        }

        .zv-sidebar__heading {
          margin: 0;
          color: #151c18;
          font-size: 24px;
          font-weight: 500;
          letter-spacing: -.65px;
          line-height: 1.45;
        }

        .zv-sidebar__nav {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .zv-sidebar__link {
          width: 100%;
          min-height: 40px;
          padding: 10px 12px;
          display: flex;
          align-items: center;
          gap: 12px;
          box-sizing: border-box;
          border-radius: 2px;
          text-decoration: none;
          color: #56645b;
          font-size: 12px;
          line-height: 1.45;
          transition:
            background .16s ease,
            color .16s ease;
        }

        .zv-sidebar__link > svg {
          flex-shrink: 0;
          color: #68766c;
        }

        .zv-sidebar__link:hover {
          background: #f5e8c7;
          color: #3c493d;
        }

        .zv-sidebar__link.is-active {
          background: #e7efe7;
          color: #075b3a;
          font-weight: 600;
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
          min-width: 18px;
          height: 18px;
          padding: 0 4px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          box-sizing: border-box;
          border-radius: 20px;
          background: #075b3a;
          color: white;
          font-size: 10px;
        }

        .zv-sidebar__discover {
          margin-top: 28px;
          padding-top: 27px;
          border-top: 1px solid #dedfd7;
        }

        .zv-sidebar__discover-title {
          margin: 0 4px 18px;
          color: #716548;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 2px;
          text-transform: uppercase;
        }

        .zv-sidebar__arrow {
          margin-left: auto;
          flex-shrink: 0;
          color: #56645b;
        }

        .zv-sidebar__promo {
          flex-shrink: 0;
          margin-top: 27px;
          padding: 24px 20px 19px;
          border: 1px solid #ead7a7;
          border-radius: 5px;
          background: #f6ebcf;
          color: #536257;
        }

        .zv-sidebar__promo-icon {
          margin-bottom: 18px;
          color: #a18443;
        }

        .zv-sidebar__promo-heading {
          margin: 0 0 14px;
          color: #141c17;
          font-size: 22px;
          font-weight: 400;
          line-height: 1.45;
          letter-spacing: -.5px;
        }

        .zv-sidebar__promo-text {
          margin: 0 0 18px;
          color: #687267;
          font-size: 12px;
          line-height: 1.75;
        }

        .zv-sidebar__promo-button {
          width: 100%;
          min-height: 38px;
          padding: 9px 10px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          border: 1px solid #bfa66c;
          border-radius: 2px;
          background: transparent;
          color: #28372d;
          font-size: 11px;
          font-family: inherit;
          text-align: left;
          cursor: pointer;
          box-sizing: border-box;
          transition: background .16s ease;
        }

        .zv-sidebar__promo-button:hover {
          background: #efe0b8;
        }

        .zv-sidebar__footer {
          margin-top: 24px;
          padding-top: 16px;
          border-top: 1px solid #ecece6;
          color: #858c83;
          font-size: 10px;
          line-height: 1.8;
        }

        .zv-sidebar__mobile-close,
        .zv-sidebar__overlay {
          display: none;
        }

        /* Create free page popup */
        .zv-free-page-overlay {
          position: fixed;
          top: 104px;
          left: 280px;
          right: 0;
          bottom: 0;
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
          padding: 30px;
          box-sizing: border-box;
          border: 1px solid #e1e2da;
          border-radius: 6px;
          background: #fff;
          color: #56645b;
          box-shadow: 0 12px 40px rgba(20, 30, 24, .16);
          font-family: Arial, sans-serif;
        }

        .zv-free-page-close {
          position: absolute;
          top: 12px;
          right: 12px;
          width: 32px;
          height: 32px;
          display: grid;
          place-items: center;
          border: 0;
          border-radius: 3px;
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
          font-size: 25px;
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
          border-radius: 3px;
          outline: none;
          background: #fff;
          color: #28372d;
          font-family: Arial, sans-serif;
          font-size: 13px;
        }

        .zv-free-page-field input:focus,
        .zv-free-page-field textarea:focus {
          border-color: #075b3a;
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
          border-radius: 3px;
          background: #075b3a;
          color: #fff;
          font-family: Arial, sans-serif;
          font-size: 13px;
          cursor: pointer;
        }

        .zv-free-page-submit:hover {
          background: #06492f;
        }

        @media (max-width: 760px) {
          .zv-sidebar {
            top: 0;
            bottom: 0;
            width: 280px;
            padding-top: 42px;
            transform: translateX(-100%);
            transition: transform .22s ease;
            z-index: 400;
          }

          .zv-sidebar.is-open {
            transform: translateX(0);
          }

          .zv-sidebar__mobile-close {
            position: absolute;
            top: 10px;
            right: 12px;
            width: 30px;
            height: 30px;
            display: grid;
            place-items: center;
            border: 0;
            background: transparent;
            color: #56645b;
            cursor: pointer;
          }

          .zv-sidebar__overlay.is-visible {
            position: fixed;
            inset: 0;
            display: block;
            background: rgba(20, 30, 24, .36);
            z-index: 399;
          }

          .zv-free-page-overlay {
            top: 76px;
            left: 0;
            padding: 16px;
          }

          .zv-free-page-popup {
            padding: 25px 20px;
          }
        }
      `}</style>

      <div
        className={`zv-sidebar__overlay ${open ? 'is-visible' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
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

        <nav className="zv-sidebar__nav">
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
                  <Icon size={20} strokeWidth={1.7} />
                  <span className="zv-sidebar__label">{label}</span>

                  {badges[label] > 0 ? (
                    <span className="zv-sidebar__badge">
                      {badges[label] > 99 ? '99+' : badges[label]}
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
            Discover &amp; grow
          </p>

          <nav className="zv-sidebar__nav">
            {discoverLinks.map(({ label, to, icon: Icon }) => (
              <NavLink
                key={label}
                to={to}
                className={({ isActive }) =>
                  `zv-sidebar__link ${isActive ? 'is-active' : ''}`
                }
                onClick={onClose}
              >
                <Icon size={20} strokeWidth={1.7} />
                <span className="zv-sidebar__label">{label}</span>
                <ArrowUpRight
                  size={16}
                  className="zv-sidebar__arrow"
                />
              </NavLink>
            ))}
          </nav>
        </section>

        <section className="zv-sidebar__promo">
          <Sparkles
            size={25}
            strokeWidth={1.6}
            className="zv-sidebar__promo-icon"
          />

          <h3 className="zv-sidebar__promo-heading">
            Your next chapter
            <br />
            starts here.
          </h3>

          <p className="zv-sidebar__promo-text">
            A professional page. A stronger network. A world of
            possibilities.
          </p>

          <button
            type="button"
            className="zv-sidebar__promo-button"
            onClick={() => {
              setShowFreePagePopup(true);
              onClose?.();
            }}
          >
            Create your free page
            <ArrowUpRight size={16} />
          </button>
        </section>

        <footer className="zv-sidebar__footer">
          ZENVE VET · The professional network
        </footer>
      </aside>

      {showFreePagePopup && (
        <div
          className="zv-free-page-overlay"
          onClick={closePopup}
        >
          <section
            className="zv-free-page-popup"
            role="dialog"
            aria-modal="true"
            aria-labelledby="zv-free-page-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="zv-free-page-close"
              onClick={closePopup}
              aria-label="Close popup"
            >
              <X size={20} />
            </button>

            <Sparkles
              size={27}
              strokeWidth={1.6}
              className="zv-free-page-icon"
            />

            <h2
              id="zv-free-page-title"
              className="zv-free-page-title"
            >
              Create your free page
            </h2>

            <p className="zv-free-page-description">
              Create your professional veterinary page and introduce
              yourself to the Zenve Vet community.
            </p>

            <form
              className="zv-free-page-form"
              onSubmit={(event) => {
                event.preventDefault();
                closePopup();
              }}
            >
              <div className="zv-free-page-field">
                <label htmlFor="zv-free-name">Full name</label>
                <input
                  id="zv-free-name"
                  name="fullName"
                  type="text"
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div className="zv-free-page-field">
                <label htmlFor="zv-free-email">Email address</label>
                <input
                  id="zv-free-email"
                  name="email"
                  type="email"
                  placeholder="Enter your email address"
                  required
                />
              </div>

              <div className="zv-free-page-field">
                <label htmlFor="zv-free-practice">
                  Professional title / clinic
                </label>
                <input
                  id="zv-free-practice"
                  name="professionalTitle"
                  type="text"
                  placeholder="e.g. Veterinary Doctor"
                />
              </div>

              <div className="zv-free-page-field">
                <label htmlFor="zv-free-about">About you</label>
                <textarea
                  id="zv-free-about"
                  name="about"
                  placeholder="Write a short introduction"
                />
              </div>

              <button
                type="submit"
                className="zv-free-page-submit"
              >
                Continue
              </button>
            </form>
          </section>
        </div>
      )}
    </>
  );
}