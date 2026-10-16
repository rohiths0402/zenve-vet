import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, ArrowUpRight, Plus, RefreshCw } from 'lucide-react';
import { AUTH_STORAGE_KEY } from '../../../shared/layout/topbarUtils.js';
import {
  getConnectionRequests,
  respondToConnectionRequest,
} from '../api/NetworkApi';
import './NetworkPage.css';

const API = (
  import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api'
).replace(/\/+$/, '');

function getToken() {
  const directToken = localStorage.getItem('zenveAccessToken');
  if (directToken) return directToken;

  try {
    const auth = JSON.parse(
      localStorage.getItem(AUTH_STORAGE_KEY) || 'null'
    );
    return auth?.access || auth?.accessToken || auth?.access_token || '';
  } catch {
    return '';
  }
}

async function apiRequest(path, options = {}) {
  const token = getToken();

  const response = await fetch(`${API}${path}`, {
    credentials: 'include',
    ...options,
    headers: {
      Accept: 'application/json',
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      data?.detail ||
        data?.message ||
        data?.error ||
        `Request failed (${response.status})`
    );
  }

  return data;
}

function extractList(data, keys = ['results', 'doctors', 'data']) {
  if (Array.isArray(data)) return data;

  for (const key of keys) {
    if (Array.isArray(data?.[key])) return data[key];
  }

  return null;
}

function doctorName(doctor) {
  return (
    doctor?.fullName ||
    doctor?.full_name ||
    doctor?.name ||
    doctor?.user?.full_name ||
    doctor?.username ||
    'Veterinary professional'
  );
}

function doctorUsername(doctor) {
  return doctor?.username || doctor?.user?.username || '';
}

function getRequestDoctor(request) {
  return (
    request.other_doctor ||
    request.requested_by ||
    request.requester ||
    request.user ||
    request.doctor ||
    {}
  );
}

function StethoscopeMark() {
  return (
    <svg
      className="vet-search-card__mark"
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M12 5v9a9 9 0 0 0 18 0V5M8 5h8M26 5h8M21 23v5a9 9 0 0 0 18 0v-3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle
        cx="39"
        cy="21"
        r="4"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  );
}

export default function NetworkPage() {
  const navigate = useNavigate();

  const [doctors, setDoctors] = useState([]);
  const [acceptedConnections, setAcceptedConnections] = useState([]);
  const [incomingRequests, setIncomingRequests] = useState([]);

  const [query, setQuery] = useState('');
  const [specialty, setSpecialty] = useState('all');
  const [state, setState] = useState('all');
  const [audience, setAudience] = useState('everyone');

  const [loading, setLoading] = useState(true);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [error, setError] = useState('');
  const [requestError, setRequestError] = useState('');
  const [notice, setNotice] = useState('');
  const [requestNotice, setRequestNotice] = useState('');

  const [sendingId, setSendingId] = useState(null);
  const [requestActionId, setRequestActionId] = useState(null);

  const loadDoctors = useCallback(async (signal) => {
    try {
      setLoading(true);
      setError('');

      const data = await apiRequest('/connections/doctors/', { signal });
      const list = extractList(data);

      if (!list) {
        throw new Error('Unexpected response from the doctors API.');
      }

      setDoctors(list);
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err.message || 'Unable to load doctors.');
      }
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  const loadIncomingRequests = useCallback(async () => {
    if (!getToken()) {
      setIncomingRequests([]);
      setRequestError('');
      return;
    }

    try {
      setRequestsLoading(true);
      setRequestError('');

      const data = await getConnectionRequests('incoming');
      const list = extractList(data, [
        'results',
        'requests',
        'connections',
        'data',
      ]);

      if (!list) {
        throw new Error(
          'Unexpected response from the incoming requests API.'
        );
      }

      setIncomingRequests(
        list.filter(
          (request) =>
            String(request.status || '').toLowerCase() === 'pending'
        )
      );
    } catch (err) {
      setRequestError(
        err.message || 'Unable to load incoming connection requests.'
      );
    } finally {
      setRequestsLoading(false);
    }
  }, []);

  const loadAcceptedConnections = useCallback(async () => {
    if (!getToken()) {
      setAcceptedConnections([]);
      return;
    }

    try {
      const data = await apiRequest('/connections/accepted/');
      const list = extractList(data, [
        'results',
        'connections',
        'data',
      ]);

      if (!list) {
        throw new Error('Unexpected response from accepted connections API.');
      }

      setAcceptedConnections(list);
    } catch (err) {
      setError(err.message || 'Unable to load accepted connections.');
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    loadDoctors(controller.signal);
    loadIncomingRequests();

    return () => controller.abort();
  }, [loadDoctors, loadIncomingRequests]);

  useEffect(() => {
    if (audience === 'connections') {
      loadAcceptedConnections();
    }
  }, [audience, loadAcceptedConnections]);

  const specialties = useMemo(
    () =>
      [...new Set(
        doctors
          .map((doctor) => doctor.specialty || doctor.specialization)
          .filter(Boolean)
      )],
    [doctors]
  );

  const states = useMemo(
    () => [...new Set(doctors.map((doctor) => doctor.state).filter(Boolean))],
    [doctors]
  );

  const acceptedIds = useMemo(() => {
    const ids = new Set();

    acceptedConnections.forEach((connection) => {
      const doctor =
        connection.other_doctor ||
        connection.doctor ||
        connection.user ||
        connection;

      const id = doctor.id ?? doctor.pk;

      if (id != null) ids.add(String(id));
    });

    return ids;
  }, [acceptedConnections]);

  const filteredDoctors = useMemo(() => {
    const searchTerm = query.trim().toLowerCase();

    return doctors.filter((doctor) => {
      const name = doctorName(doctor);
      const username = doctorUsername(doctor);
      const doctorSpecialty =
        doctor.specialty || doctor.specialization || '';

      const searchable = [
        name,
        username,
        doctorSpecialty,
        doctor.city,
        doctor.state,
        doctor.about,
        doctor.bio,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      const matchesQuery =
        !searchTerm || searchable.includes(searchTerm);

      const matchesSpecialty =
        specialty === 'all' || doctorSpecialty === specialty;

      const matchesState = state === 'all' || doctor.state === state;

      const id = String(doctor.id ?? doctor.pk ?? '');

      const matchesAudience =
        audience === 'everyone' ||
        doctor.is_connected === true ||
        doctor.connection_status === 'accepted' ||
        acceptedIds.has(id);

      return (
        matchesQuery &&
        matchesSpecialty &&
        matchesState &&
        matchesAudience
      );
    });
  }, [doctors, query, specialty, state, audience, acceptedIds]);

  function clearFilters() {
    setQuery('');
    setSpecialty('all');
    setState('all');
    setAudience('everyone');
  }

  async function handleConnect(doctor) {
    if (!getToken()) {
      navigate('/login');
      return;
    }

    const doctorId = doctor.id ?? doctor.pk;
    const username = doctorUsername(doctor);

    if (doctorId == null || !username) {
      setError('The doctor record is missing its ID or username.');
      return;
    }

    setSendingId(doctorId);
    setError('');
    setNotice('');

    try {
      const data = await apiRequest('/connections/requests/', {
        method: 'POST',
        body: JSON.stringify({ username }),
      });

      setDoctors((current) =>
        current.map((item) =>
          String(item.id ?? item.pk) === String(doctorId)
            ? { ...item, connection_status: 'pending' }
            : item
        )
      );

      setNotice(
        data?.detail || `Connection request sent to ${doctorName(doctor)}.`
      );
    } catch (err) {
      setError(err.message || 'Could not send connection request.');
    } finally {
      setSendingId(null);
    }
  }

  async function handleRequestAction(request, action) {
    if (requestActionId !== null) return;

    setRequestActionId(request.id);
    setRequestError('');
    setRequestNotice('');

    try {
      await respondToConnectionRequest(request.id, action);

      setIncomingRequests((current) =>
        current.filter((item) => item.id !== request.id)
      );

      if (action === 'accept') {
        await loadAcceptedConnections();

        setRequestNotice('Connection request accepted.');
      } else {
        setRequestNotice('Connection request rejected.');
      }
    } catch (err) {
      setRequestError(
        err.message || `Unable to ${action} connection request.`
      );

      await loadIncomingRequests();
    } finally {
      setRequestActionId(null);
    }
  }

  return (
    <main className="vet-search-page">
      <header className="vet-search-hero">
        <p className="vet-search-eyebrow">
          A COMMUNITY WITHOUT BOUNDARIES
        </p>

        <h1>Find your kind of brilliant.</h1>

        <p className="vet-search-subtitle">
          Veterinary perspectives from every corner of India.
        </p>
      </header>

      {/* Incoming connection requests */}
      <section
        className="connection-requests-panel"
        aria-label="Incoming connection requests"
      >
        <div className="connection-requests-panel__heading">
          <div>
            <p className="connection-requests-panel__eyebrow">
              YOUR NETWORK
            </p>
            <h2>Incoming connection requests</h2>
          </div>

          <div className="connection-requests-panel__heading-actions">
            <span className="connection-requests-panel__count">
              {incomingRequests.length}
            </span>

            <button
              type="button"
              className="connection-requests-panel__refresh"
              onClick={loadIncomingRequests}
              disabled={requestsLoading}
              aria-label="Refresh incoming requests"
              title="Refresh requests"
            >
              <RefreshCw
                size={16}
                className={requestsLoading ? 'is-spinning' : ''}
              />
            </button>
          </div>
        </div>

        {requestError && (
          <div className="connection-requests-panel__error" role="alert">
            <p>{requestError}</p>
            <button type="button" onClick={loadIncomingRequests}>
              Retry
            </button>
          </div>
        )}

        {requestNotice && (
          <p className="connection-requests-panel__notice" role="status">
            {requestNotice}
          </p>
        )}

        {requestsLoading && incomingRequests.length === 0 ? (
          <p className="connection-requests-panel__empty">
            Loading connection requests...
          </p>
        ) : incomingRequests.length === 0 ? (
          <p className="connection-requests-panel__empty">
            No pending connection requests.
          </p>
        ) : (
          <div className="connection-requests-list">
            {incomingRequests.map((request) => {
              const doctor = getRequestDoctor(request);
              const name = doctorName(doctor);
              const location = [doctor.city, doctor.state]
                .filter(Boolean)
                .join(', ');

              return (
                <article
                  className="connection-request-card"
                  key={request.id}
                >
                  <div className="connection-request-card__avatar">
                    {name
                      .replace(/^Dr\.\s*/i, '')
                      .split(/\s+/)
                      .filter(Boolean)
                      .slice(0, 2)
                      .map((part) => part[0].toUpperCase())
                      .join('')}
                  </div>

                  <div className="connection-request-card__details">
                    <h3>{name}</h3>

                    <p>
                      {doctor.specialty ||
                        doctor.specialization ||
                        'Veterinary professional'}
                    </p>

                    {location && <small>{location}</small>}
                  </div>

                  <div className="connection-request-card__actions">
                    <button
                      type="button"
                      className="connection-request-card__accept"
                      disabled={requestActionId !== null}
                      onClick={() => handleRequestAction(request, 'accept')}
                    >
                      {requestActionId === request.id
                        ? 'Please wait...'
                        : 'Accept'}
                    </button>

                    <button
                      type="button"
                      className="connection-request-card__reject"
                      disabled={requestActionId !== null}
                      onClick={() => handleRequestAction(request, 'reject')}
                    >
                      Reject
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* Doctor directory and existing filters */}
      <section
        className="vet-search-content"
        aria-label="Find professionals"
      >
        <div className="vet-search-filters">
          <label className="vet-search-field vet-search-field--search">
            <Search size={20} aria-hidden="true" />

            <input
              type="search"
              aria-label="Search professionals"
              placeholder="Name, specialty or city"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>

          <label className="vet-search-field vet-search-field--select">
            <span className="sr-only">Specialty</span>

            <select
              aria-label="Filter by specialty"
              value={specialty}
              onChange={(event) => setSpecialty(event.target.value)}
            >
              <option value="all">All specialties</option>

              {specialties.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <label className="vet-search-field vet-search-field--select">
            <span className="sr-only">State</span>

            <select
              aria-label="Filter by state"
              value={state}
              onChange={(event) => setState(event.target.value)}
            >
              <option value="all">All states</option>

              {states.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <label className="vet-search-field vet-search-field--audience">
            <span className="sr-only">Audience</span>

            <select
              aria-label="Filter audience"
              value={audience}
              onChange={(event) => setAudience(event.target.value)}
            >
              <option value="everyone">Everyone</option>
              <option value="connections">Connections</option>
            </select>
          </label>
        </div>

        <div className="vet-search-results-heading">
          <span>
            {filteredDoctors.length} professional
            {filteredDoctors.length === 1 ? '' : 's'}
          </span>

          <div className="vet-search-results-meta">
            <span>Veterinary professionals</span>

            {(query ||
              specialty !== 'all' ||
              state !== 'all' ||
              audience !== 'everyone') && (
              <button type="button" onClick={clearFilters}>
                Clear filters
              </button>
            )}
          </div>
        </div>

        {notice && (
          <p className="connection-requests-panel__notice" role="status">
            {notice}
          </p>
        )}

        {error && (
          <div className="connection-requests-panel__error" role="alert">
            <p>{error}</p>
            <button type="button" onClick={() => loadDoctors()}>
              Retry loading doctors
            </button>
          </div>
        )}

        {loading && (
          <p role="status">Loading veterinary professionals...</p>
        )}

        {!loading && !error && filteredDoctors.length > 0 && (
          <div className="vet-search-grid">
            {filteredDoctors.map((doctor, index) => {
              const name = doctorName(doctor);
              const username = doctorUsername(doctor);
              const id = doctor.id ?? doctor.pk ?? username ?? index;
              const status = doctor.connection_status;
              const isSending =
                String(sendingId) === String(doctor.id ?? doctor.pk);

              return (
                <article className="vet-search-card" key={id}>
                  <div className="vet-search-card__banner">
                    <StethoscopeMark />
                    <span>{doctor.city || 'Location not specified'}</span>
                  </div>

                  <div className="vet-search-card__body">
                    <div
                      className="vet-search-card__avatar"
                      aria-hidden="true"
                    >
                      {name
                        .replace(/^Dr\.\s*/i, '')
                        .split(/\s+/)
                        .filter(Boolean)
                        .slice(0, 2)
                        .map((part) => part[0].toUpperCase())
                        .join('')}
                    </div>

                    <p className="vet-search-card__eyebrow">
                      VETERINARY PROFESSIONAL
                    </p>

                    <h2>{name}</h2>

                    <p className="vet-search-card__specialty">
                      {doctor.specialty ||
                        doctor.specialization ||
                        'Specialty not specified'}
                    </p>

                    <p className="vet-search-card__location">
                      <MapPin size={15} aria-hidden="true" />
                      {[doctor.city, doctor.state]
                        .filter(Boolean)
                        .join(', ') || 'Location not specified'}
                    </p>

                    <div className="vet-search-card__actions">
                      <button
                        type="button"
                        className="vet-search-card__view"
                        disabled={!username}
                        onClick={() => navigate(`/doctors/${username}`)}
                      >
                        View page
                        <ArrowUpRight size={17} aria-hidden="true" />
                      </button>

                      <button
                        type="button"
                        className="vet-search-card__connect"
                        aria-label={`Connect with ${name}`}
                        disabled={
                          isSending ||
                          status === 'pending' ||
                          status === 'accepted'
                        }
                        onClick={() => handleConnect(doctor)}
                      >
                        {status === 'accepted'
                          ? '✓'
                          : status === 'pending' || isSending
                            ? '…'
                            : <Plus size={21} aria-hidden="true" />}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {!loading && !error && filteredDoctors.length === 0 && (
          <div className="vet-search-empty">
            <Search size={28} aria-hidden="true" />
            <h2>No professionals found</h2>
            <p>Try another name, specialty, or state.</p>

            <button type="button" onClick={clearFilters}>
              Clear filters
            </button>
          </div>
        )}
      </section>
    </main>
  );
}