
import { useEffect, useState } from 'react';
import { Search, Plus, X, ArrowUpRight } from 'lucide-react';
import { createPortal } from 'react-dom';

export default function Topbar() {
  const [showPopup, setShowPopup] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    role: '',
    specialty: '',
    city: '',
    about: '', 
  });

  useEffect(() => {
    if (!showPopup) return;

    const handleEscape = (event) => {
      if (event.key === 'Escape') setShowPopup(false);
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleEscape);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleEscape);
    };
  }, [showPopup]);

  useEffect(() => {
    const openProfile = () => setShowPopup(true);
    window.addEventListener('zenve-open-profile', openProfile);
    return () => window.removeEventListener('zenve-open-profile', openProfile);
  }, []);

  const updateField = (event) => {
    setForm((previous) => ({
      ...previous,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    console.log('Professional profile:', form);
    setShowPopup(false);
  };

  return (
    <>
      <style>{`
        .zenve-topbar {
          position: fixed;
          inset: 0 0 auto 0;
          height: 104px;
          box-sizing: border-box;
          display: grid;
          grid-template-columns: 280px minmax(220px, 460px) 1fr;
          align-items: center;
          gap: 28px;
          padding: 0 24px;
          background: #fff;
          border-bottom: 1px solid #e7e7e0;
          z-index: 200;
          font-family: Arial, sans-serif;
        }

        .zenve-brand {
          display: flex;
          align-items: center;
          gap: 12px;
          color: #075a3a;
          text-decoration: none;
        }

        .zenve-brand__mark {
          width: 37px;
          height: 42px;
          display: grid;
          place-items: center;
          flex-shrink: 0;
          border: 1px solid #e5d7ad;
          background: #fbf7eb;
          font-family: Georgia, serif;
          font-size: 15px;
          font-weight: 700;
        }

        .zenve-brand__name {
          margin: 0;
          font-size: 22px;
          letter-spacing: 2px;
          font-weight: 700;
        }

        .zenve-brand__tagline {
          margin: 5px 0 0;
          color: #6f756e;
          font-size: 9px;
          letter-spacing: 2px;
          white-space: nowrap;
        }

        .zenve-search {
          height: 39px;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 0 12px;
          border: 1px solid #e4e5df;
          border-radius: 4px;
          background: #f8f8f5;
          color: #64716a;
          box-sizing: border-box;
        }

        .zenve-search input {
          width: 100%;
          min-width: 0;
          border: 0;
          outline: none;
          background: transparent;
          font-size: 12px;
        }

        .zenve-search__country {
          padding-left: 12px;
          border-left: 1px solid #e2e3dc;
          font-size: 9px;
          letter-spacing: 1px;
        }

        .zenve-topbar__actions {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 24px;
        }

        .zenve-community {
          display: flex;
          align-items: center;
          gap: 7px;
          white-space: nowrap;
          color: #647168;
          font-size: 11px;
        }

        .zenve-community__dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #28875b;
        }

        .zenve-profile-btn {
          min-height: 39px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 0 14px;
          border: 1px solid #ead9ad;
          border-radius: 2px;
          background: #f8efda;
          color: #242a24;
          font-size: 12px;
          cursor: pointer;
        }

        .zenve-profile-btn:hover {
          background: #f0e2bd;
        }

        /* Popup overlay: rendered outside the app layout */
        .profile-modal-overlay {
          position: fixed;
          inset: 0;
          z-index: 2147483647;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          box-sizing: border-box;
          background: rgba(20, 30, 24, 0.48);
          font-family: Arial, sans-serif;
          color: #17221d;
        }

        .profile-modal {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 650px;
          max-height: calc(100vh - 40px);
          overflow-y: auto;
          box-sizing: border-box;
          padding: 30px 27px 27px;
          background: #fff;
        }

        .profile-modal__close {
          position: absolute;
          top: 15px;
          right: 18px;
          display: grid;
          place-items: center;
          width: 28px;
          height: 28px;
          padding: 0;
          border: 0;
          background: transparent;
          color: #58645d;
          cursor: pointer;
        }

        .profile-modal__title {
          margin: 0 30px 25px 0;
          font-size: 29px;
          font-weight: 750;
          letter-spacing: -.6px;
          line-height: 1.25;
        }

        .profile-modal__intro {
          margin: 0 0 24px;
          color: #617067;
          font-size: 17px;
          line-height: 1.5;
        }

        .profile-modal__field {
          display: block;
          margin-bottom: 20px;
        }

        .profile-modal__label {
          display: block;
          margin-bottom: 10px;
          color: #5e6c63;
          font-size: 13px;
        }

        .profile-modal__input,
        .profile-modal__textarea {
          display: block;
          width: 100%;
          box-sizing: border-box;
          padding: 0 15px;
          border: 1px solid #e0e1d9;
          border-radius: 5px;
          outline: none;
          background: #f7f7f4;
          color: #28372f;
          font: inherit;
          font-size: 15px;
        }

        .profile-modal__input {
          height: 51px;
        }

        .profile-modal__textarea {
          min-height: 100px;
          padding-top: 15px;
          resize: vertical;
          line-height: 1.5;
        }

        .profile-modal__input:focus,
        .profile-modal__textarea:focus {
          border-color: #075a3a;
          background: #fff;
        }

        .profile-modal__input::placeholder,
        .profile-modal__textarea::placeholder {
          color: #92968f;
          opacity: 1;
        }

        .profile-modal__note {
          margin: -2px 0 18px;
          color: #5e6c63;
          font-size: 14px;
          line-height: 1.45;
        }

        .profile-modal__submit {
          width: 100%;
          min-height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          border: 1px solid #ead29b;
          border-radius: 2px;
          background: #f8efD4;
          color: #151b17;
          font-size: 14px;
          cursor: pointer;
        }

        .profile-modal__submit:hover {
          background: #f1e2bd;
        }

        @media (max-width: 900px) {
          .zenve-topbar {
            grid-template-columns: 220px minmax(140px, 1fr) auto;
            gap: 14px;
            padding: 0 16px;
          }

          .zenve-community {
            display: none;
          }
        }

        @media (max-width: 600px) {
          .zenve-topbar {
            height: 76px;
            grid-template-columns: 1fr auto;
            gap: 10px;
            padding: 0 12px;
          }

          .zenve-brand__mark {
            width: 31px;
            height: 34px;
          }

          .zenve-brand__name {
            font-size: 16px;
            letter-spacing: 1px;
          }

          .zenve-brand__tagline {
            font-size: 7px;
            letter-spacing: 1px;
          }

          .zenve-search {
            display: none;
          }

          .zenve-profile-btn {
            min-height: 35px;
            padding: 0 9px;
            font-size: 11px;
          }

          .profile-modal {
            padding: 28px 20px 22px;
          }

          .profile-modal__title {
            font-size: 25px;
            margin-bottom: 20px;
          }

          .profile-modal__intro {
            font-size: 15px;
          }
        }
      `}</style>

      <header className="zenve-topbar">
        <a href="/" className="zenve-brand" aria-label="Zenve Vet home">
          <span className="zenve-brand__mark">ZV</span>
          <span>
            <p className="zenve-brand__name">
              ZENVE VET<sup style={{ fontSize: 9 }}>™</sup>
            </p>
            <p className="zenve-brand__tagline">
              THE PROFESSIONAL NETWORK
            </p>
          </span>
        </a>

        <label className="zenve-search">
          <Search size={16} />
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

          <button
            type="button"
            className="zenve-profile-btn"
            onClick={() => setShowPopup(true)}
          >
            <Plus size={15} />
            Create your profile
          </button>
        </div>
      </header>

      {showPopup &&
        createPortal(
          <div
            className="profile-modal-overlay"
            onClick={() => setShowPopup(false)}
          >
            <section
              className="profile-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="profile-modal-title"
              onClick={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                className="profile-modal__close"
                onClick={() => setShowPopup(false)}
                aria-label="Close"
              >
                <X size={19} />
              </button>

              <h2
                id="profile-modal-title"
                className="profile-modal__title"
              >
                Make your professional mark.
              </h2>

              <p className="profile-modal__intro">
                Start building your veterinary profile.
              </p>

              <form onSubmit={handleSubmit}>
                <label className="profile-modal__field">
                  <span className="profile-modal__label">Full name</span>
                  <input className="profile-modal__input" name="name" value={form.name} onChange={updateField} placeholder="Enter your full name" required />
                </label>

                <label className="profile-modal__field">
                  <span className="profile-modal__label">Professional email</span>
                  <input className="profile-modal__input" type="email" name="email" value={form.email} onChange={updateField} placeholder="you@example.com" required />
                </label>

                <label className="profile-modal__field">
                  <span className="profile-modal__label">Professional role</span>
                  <select className="profile-modal__input" name="role" value={form.role} onChange={updateField} required>
                    <option value="">Select your role</option>
                    <option>Veterinarian</option>
                    <option>Veterinary student</option>
                    <option>Veterinary researcher</option>
                    <option>Veterinary educator</option>
                    <option>Animal health professional</option>
                    <option>Other</option>
                  </select>
                </label>

                <label className="profile-modal__field">
                  <span className="profile-modal__label">Specialty / area of interest</span>
                  <input className="profile-modal__input" name="specialty" value={form.specialty} onChange={updateField} placeholder="e.g. Small animal practice" />
                </label>

                <label className="profile-modal__field">
                  <span className="profile-modal__label">City</span>
                  <input className="profile-modal__input" name="city" value={form.city} onChange={updateField} placeholder="Your city" required />
                </label>

                <label className="profile-modal__field">
                  <span className="profile-modal__label">Tell us about yourself</span>
                  <textarea className="profile-modal__textarea" name="about" value={form.about} onChange={updateField} placeholder="Your experience, interests and professional goals..." />
                </label>

                <button type="submit" className="profile-modal__submit">
                  Create your free page <ArrowUpRight size={17} />
                </button>

                <p className="profile-modal__note" style={{ textAlign: 'center', fontSize: 11 }}>
                  Frontend demo only. Form details are not sent to a server.
                </p>
              </form>
            </section>
          </div>,
          document.body
        )}
    </>
  );
}
