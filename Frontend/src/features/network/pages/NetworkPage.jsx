
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

import useNetwork from '../hooks/useNetwork';
import DoctorCard from '../components/DoctorCard';
import ConnectionRequestModal from '../components/ConnectionRequestModal';

import SignInModal from '../../auth/components/SignInModal';
import RegistrationModal from '../../auth/components/RegistrationModal';

import { AUTH_STORAGE_KEY } from '../../../shared/layout/topbarUtils.js';

import './NetworkPage.css';

export default function NetworkPage() {
  const navigate = useNavigate();

  const {
    doctors,
    search,
    setSearch,
    loading,
    error,
    refresh,
  } = useNetwork();

  const [authModal, setAuthModal] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [notice, setNotice] = useState('');

  function isAuthenticated() {
    try {
      return Boolean(
        JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY) || 'null')
      );
    } catch {
      return false;
    }
  }

  function handleConnect(doctor) {
    setNotice('');

    if (!isAuthenticated()) {
      setAuthModal('signin');
      return;
    }

    setSelectedDoctor(doctor);
  }

  function closeAuthModal() {
    setAuthModal(null);
  }

  function openRegistration() {
    setAuthModal('register');
  }

  function openSignIn() {
    setAuthModal('signin');
  }

  return (
    <main className="network-page">
      <section className="network-page__hero">
        <div className="network-page__hero-content">
          <p className="network-page__eyebrow">
            ZENVE VET COMMUNITY
          </p>

          <h1>Vet Network</h1>

          <p className="network-page__description">
            Discover veterinary professionals, explore specialties,
            and build meaningful professional connections.
          </p>
        </div>

        <div className="network-page__hero-mark" aria-hidden="true">
          ZV
        </div>
      </section>

      <section className="network-page__content">
        <nav className="network-request-tabs" aria-label="Network sections">
          <Link className="is-active" to="/network">Discover vets</Link>
          <Link to="/network/requests">Received requests</Link>
          <Link to="/network/sent-requests">Sent requests</Link>
        </nav>

        <div className="network-page__heading">
          <div>
            <h2>Discover professionals</h2>
            <p>Find people across the veterinary community.</p>
          </div>

          <span className="network-page__count">
            {loading ? 'Loading…' : `${doctors.length} professionals`}
          </span>
        </div>

        <div className="network-page__search">
          <span aria-hidden="true">⌕</span>

          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name, specialty, city..."
            aria-label="Search veterinary professionals"
          />

          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              aria-label="Clear search"
            >
              Clear
            </button>
          )}
        </div>

        {notice && (
          <p className="network-page__notice" role="status">{notice}</p>
        )}

        {loading && (
          <div className="network-page__state" role="status">
            <span className="network-page__spinner" />
            <p>Loading veterinary professionals…</p>
          </div>
        )}

        {!loading && error && (
          <div className="network-page__state network-page__state--error">
            <h3>Unable to load the network</h3>
            <p>{error}</p>

            <button type="button" onClick={refresh}>
              Try again
            </button>
          </div>
        )}

        {!loading && !error && doctors.length === 0 && (
          <div className="network-page__state">
            <h3>
              {search ? 'No matching professionals' : 'No professionals yet'}
            </h3>

            <p>
              {search
                ? 'Try another name, specialty, or location.'
                : 'Professionals will appear here when doctor data is available.'}
            </p>

            {search && (
              <button type="button" onClick={() => setSearch('')}>
                Clear search
              </button>
            )}
          </div>
        )}

        {!loading && !error && doctors.length > 0 && (
          <div className="network-page__grid">
            {doctors.map((doctor, index) => (
              <DoctorCard
                key={doctor.id ?? doctor.pk ?? doctor.username ?? index}
                doctor={doctor}
                onViewProfile={(id) => navigate(`/doctors/${id}`)}
                onConnect={handleConnect}
              />
            ))}
          </div>
        )}
      </section>

      {selectedDoctor && (
        <ConnectionRequestModal
          doctor={selectedDoctor}
          onClose={() => setSelectedDoctor(null)}
          onSent={(doctor) => setNotice(`Connection request sent to ${doctor.full_name || doctor.name || doctor.username || 'the professional'}.`)}
        />
      )}

      {authModal === 'signin' && (
        <SignInModal
          onClose={closeAuthModal}
          onRegister={openRegistration}
        />
      )}

      {authModal === 'register' && (
        <RegistrationModal
          onClose={closeAuthModal}
          onSignIn={openSignIn}
        />
      )}
    </main>
  );
}
  