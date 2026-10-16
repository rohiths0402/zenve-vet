
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import useNetwork from '../hooks/useNetwork';
import DoctorCard from '../components/DoctorCard';

import SignInModal from '../../auth/components/SignInModal';
import RegistrationModal from '../../auth/components/RegistrationModal';

import { AUTH_STORAGE_KEY } from '../../../shared/layout/topbarUtils.js';
import { sendConnectionRequest } from '../api/NetworkApi';

import './SearchPage.css';

const SPECIALTIES = [
  'Dermatology',
  'Surgery',
  'Livestock',
  'Equine',
  'Imaging',
  'Nutrition',
  'Wildlife',
  'Preventive',
];

export default function SearchPage() {
  const navigate = useNavigate();

  const {
    doctors = [],
    search,
    setSearch,
    loading,
    error,
    refresh,
  } = useNetwork();

  const [stateFilter, setStateFilter] = useState('all');
  const [selectedSpecialties, setSelectedSpecialties] = useState([]);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [hasTakeaways, setHasTakeaways] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  const [authModal, setAuthModal] = useState(null);
  const [notice, setNotice] = useState('');
  const [connectingUsername, setConnectingUsername] = useState(null);
  const [sentRequests, setSentRequests] = useState([]);

  const states = useMemo(
    () =>
      [
        ...new Set(
          doctors
            .map((doctor) => doctor.state || doctor.profile?.state)
            .filter(Boolean)
        ),
      ].sort(),
    [doctors]
  );

  const filteredDoctors = useMemo(() => {
    return doctors.filter((doctor) => {
      const state = doctor.state || doctor.profile?.state || '';

      const specialty =
        doctor.specialty ||
        doctor.specialization ||
        doctor.profile?.specialty ||
        doctor.profile?.specialization ||
        '';

      const verified =
        doctor.is_verified === true || doctor.verified === true;

      const takeaways =
        doctor.has_takeaways === true ||
        (Array.isArray(doctor.takeaways) && doctor.takeaways.length > 0) ||
        doctor.profile?.has_takeaways === true;

      return (
        (stateFilter === 'all' || state === stateFilter) &&
        (selectedSpecialties.length === 0 ||
          selectedSpecialties.some((item) =>
            specialty.toLowerCase().includes(item.toLowerCase())
          )) &&
        (!verifiedOnly || verified) &&
        (!hasTakeaways || takeaways)
      );
    });
  }, [
    doctors,
    stateFilter,
    selectedSpecialties,
    verifiedOnly,
    hasTakeaways,
  ]);

  function isAuthenticated() {
    const token = localStorage.getItem('zenveAccessToken');

    try {
      const user = JSON.parse(
        localStorage.getItem(AUTH_STORAGE_KEY) || 'null'
      );

      return Boolean(
        token || user?.id || user?.pk || user?.username
      );
    } catch {
      return Boolean(token);
    }
  }

  function getDoctorName(doctor) {
    return (
      doctor.fullName ||
      doctor.full_name ||
      doctor.name ||
      doctor.username ||
      'this doctor'
    );
  }

  function getDoctorUsername(doctor) {
    return doctor.username || '';
  }

  function openDoctorProfile(doctor) {
    const identifier = getDoctorUsername(doctor) || doctor.id || doctor.pk;

    if (identifier) {
      navigate(`/doctors/${encodeURIComponent(identifier)}`);
    }
  }

  async function handleConnect(doctor) {
    setNotice('');

    if (!isAuthenticated()) {
      setAuthModal('signin');
      return;
    }

    const username = getDoctorUsername(doctor);

    if (!username) {
      setNotice('This doctor has no username in the API response.');
      return;
    }

    if (sentRequests.includes(username)) {
      setNotice(`A connection request was already sent to ${getDoctorName(doctor)}.`);
      return;
    }

    setConnectingUsername(username);

    try {
      await sendConnectionRequest(username);

      setSentRequests((current) => [...current, username]);
      setNotice(`Connection request sent to ${getDoctorName(doctor)}.`);
    } catch (err) {
      setNotice(
        err.message || 'Unable to send the connection request.'
      );
    } finally {
      setConnectingUsername(null);
    }
  }

  function toggleSpecialty(specialty) {
    setSelectedSpecialties((current) =>
      current.includes(specialty)
        ? current.filter((item) => item !== specialty)
        : [...current, specialty]
    );
  }

  function clearFilters() {
    setSearch('');
    setStateFilter('all');
    setSelectedSpecialties([]);
    setVerifiedOnly(false);
    setHasTakeaways(false);
  }

  return (
    <main className="discover-page">
      <header className="discover-hero">
        <p className="discover-eyebrow">DISCOVER</p>
        <h1>Find people, cases &amp; answers.</h1>
      </header>

      <section className="discover-content">
        <div className="discover-search-row">
          <label className="discover-search">
            <span aria-hidden="true">⌕</span>

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={'Try "pyoderma Kerala" or "dairy lameness"'}
              aria-label="Search veterinary professionals"
            />

            {search && (
              <button type="button" onClick={() => setSearch('')}>
                Clear
              </button>
            )}
          </label>

          <select
            value={stateFilter}
            onChange={(event) => setStateFilter(event.target.value)}
            aria-label="Filter by state"
          >
            <option value="all">All states</option>
            {states.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
        </div>

        <div className="discover-specialties">
          {SPECIALTIES.map((specialty) => (
            <button
              key={specialty}
              type="button"
              className={
                selectedSpecialties.includes(specialty)
                  ? 'discover-chip discover-chip--active'
                  : 'discover-chip'
              }
              aria-pressed={selectedSpecialties.includes(specialty)}
              onClick={() => toggleSpecialty(specialty)}
            >
              {specialty}
            </button>
          ))}

          <label className="discover-toggle">
            <input
              type="checkbox"
              checked={verifiedOnly}
              onChange={(event) => setVerifiedOnly(event.target.checked)}
            />
            <span>Verified only</span>
          </label>

          <label className="discover-toggle">
            <input
              type="checkbox"
              checked={hasTakeaways}
              onChange={(event) => setHasTakeaways(event.target.checked)}
            />
            <span>Has takeaways</span>
          </label>
        </div>

        <nav className="discover-tabs" aria-label="Search categories">
          {[
            ['all', 'All'],
            ['doctors', 'Doctors'],
            ['cases', 'Cases'],
            ['stories', 'Stories & videos'],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              className={
                activeTab === value
                  ? 'discover-tab discover-tab--active'
                  : 'discover-tab'
              }
              onClick={() => setActiveTab(value)}
            >
              {label}
              {(value === 'all' || value === 'doctors') && (
                <span>{doctors.length}</span>
              )}
            </button>
          ))}
        </nav>

        {notice && (
          <p className="discover-notice" role="status">
            {notice}
          </p>
        )}

        {loading && (
          <div className="discover-state" role="status">
            Loading veterinary professionals…
          </div>
        )}

        {!loading && error && (
          <div className="discover-state discover-state--error">
            <h2>Unable to load results</h2>
            <p>{error}</p>
            <button type="button" onClick={refresh}>
              Try again
            </button>
          </div>
        )}

        {!loading && !error && (
          <>
            {(activeTab === 'all' || activeTab === 'doctors') && (
              <>
                <h2 className="discover-section-title">Doctors</h2>

                {filteredDoctors.length > 0 ? (
                  <div className="discover-doctor-grid">
                    {filteredDoctors.map((doctor, index) => {
                      const username = getDoctorUsername(doctor);
                      const alreadySent = sentRequests.includes(username);
                      const isConnecting = connectingUsername === username;

                      return (
                        <div
                          className="discover-doctor-item"
                          key={doctor.id ?? doctor.pk ?? username ?? index}
                        >
                          <DoctorCard
                            doctor={doctor}
                            onViewProfile={() => openDoctorProfile(doctor)}
                            onConnect={() => handleConnect(doctor)}
                          />

                          {username && (
                            <p className="discover-connection-status">
                              {isConnecting
                                ? 'Sending request…'
                                : alreadySent
                                  ? 'Request sent'
                                  : ''}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="discover-state">
                    <h2>No matching doctors</h2>
                    <p>
                      {doctors.length === 0
                        ? 'No doctor records were returned by the backend.'
                        : 'Try changing your search or filters.'}
                    </p>
                    <button type="button" onClick={clearFilters}>
                      Clear filters
                    </button>
                  </div>
                )}
              </>
            )}

            {(activeTab === 'cases' || activeTab === 'stories') && (
              <div className="discover-state">
                <h2>
                  {activeTab === 'cases' ? 'Clinical cases' : 'Stories & videos'}
                </h2>
                <p>
                  This category needs its own backend endpoint before it can
                  display live results.
                </p>
              </div>
            )}
          </>
        )}
      </section>

      {authModal === 'signin' && (
        <SignInModal
          onClose={() => setAuthModal(null)}
          onRegister={() => setAuthModal('register')}
        />
      )}

      {authModal === 'register' && (
        <RegistrationModal
          onClose={() => setAuthModal(null)}
          onSignIn={() => setAuthModal('signin')}
        />
      )}
    </main>
  );
}
