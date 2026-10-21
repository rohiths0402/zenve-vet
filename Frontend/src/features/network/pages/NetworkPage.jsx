import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  MapPin,
  ArrowUpRight,
  Plus,
  RefreshCw,
  Users,
  UserCheck,
  Send,
  Check,
  X,
} from 'lucide-react';
import { AUTH_STORAGE_KEY } from '../../../shared/layout/topbarUtils.js';
import {
  getConnectionRequests,
  respondToConnectionRequest,
  withdrawConnectionRequest,
} from '../api/NetworkApi';
import './NetworkPage.css';

const API = (
  import.meta.env.VITE_API_BASE_URL ||
  'http://127.0.0.1:8000/api'
).replace(/\/+$/, '');

const PAGE_SIZE = 12;

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

function doctorId(doctor) {
  return doctor?.id ?? doctor?.pk ?? doctor?.user?.id ?? null;
}

function doctorImage(doctor) {
  return (
    doctor?.profile_photo_url ||
    doctor?.profile_picture ||
    doctor?.profilePicture ||
    doctor?.avatar_url ||
    doctor?.avatar ||
    doctor?.profile_image ||
    ''
  );
}

function initials(name) {
  return (
    String(name || 'V')
      .replace(/^Dr\.\s*/i, '')
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0].toUpperCase())
      .join('') || 'V'
  );
}

function getIncomingDoctor(request) {
  return (
    request.other_doctor ||
    request.requested_by ||
    request.requester ||
    request.sender ||
    request.user ||
    request.doctor ||
    {}
  );
}

function getOutgoingDoctor(request) {
  return (
    request.requested_to ||
    request.recipient ||
    request.receiver ||
    request.other_doctor ||
    request.doctor ||
    request.user ||
    {}
  );
}

function isPending(request) {
  return String(request?.status || '').toLowerCase() === 'pending';
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

  const [activeTab, setActiveTab] = useState('discover');

  const [doctors, setDoctors] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalDoctors, setTotalDoctors] = useState(0);
  const [acceptedConnections, setAcceptedConnections] = useState([]);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);

  const [query, setQuery] = useState('');
  const [specialty, setSpecialty] = useState('all');
  const [state, setState] = useState('all');
  const [audience, setAudience] = useState('everyone');

  const [loading, setLoading] = useState(true);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [sentRequestsLoading, setSentRequestsLoading] = useState(false);

  const [error, setError] = useState('');
  const [requestError, setRequestError] = useState('');
  const [sentRequestsError, setSentRequestsError] = useState('');

  const [notice, setNotice] = useState('');
  const [requestNotice, setRequestNotice] = useState('');

  const [sendingId, setSendingId] = useState(null);
  const [requestActionId, setRequestActionId] = useState(null);
  const [withdrawingId, setWithdrawingId] = useState(null);

  // Load one page of doctors from Django's paginated directory API.
  const loadDoctors = useCallback(async (signal, page = 1) => {
    try {
      setLoading(true);
      setError('');

      const data = await apiRequest(
        `/connections/doctors/?page=${page}&page_size=${PAGE_SIZE}`,
        { signal }
      );
      const list = extractList(data);

      if (!list) {
        throw new Error('Unexpected response from the doctors API.');
      }

      setDoctors(list);
      setTotalDoctors(
        typeof data?.count === 'number' ? data.count : list.length
      );
      setCurrentPage(page);
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err.message || 'Unable to load doctors.');
      }
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  // Load incoming connection requests.
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
        throw new Error('Unexpected response from incoming requests API.');
      }

      setIncomingRequests(list.filter(isPending));
    } catch (err) {
      setRequestError(
        err.message || 'Unable to load received connection requests.'
      );
    } finally {
      setRequestsLoading(false);
    }
  }, []);

  // Load outgoing connection requests.
  const loadSentRequests = useCallback(async () => {
    if (!getToken()) {
      setSentRequests([]);
      setSentRequestsError('');
      return;
    }

    try {
      setSentRequestsLoading(true);
      setSentRequestsError('');

      const data = await getConnectionRequests('outgoing');
      const list = extractList(data, [
        'results',
        'requests',
        'connections',
        'data',
      ]);

      if (!list) {
        throw new Error('Unexpected response from outgoing requests API.');
      }

      setSentRequests(list.filter(isPending));
    } catch (err) {
      setSentRequestsError(
        err.message || 'Unable to load sent connection requests.'
      );
    } finally {
      setSentRequestsLoading(false);
    }
  }, []);

  // Load accepted connections.
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
    loadSentRequests();

    return () => controller.abort();
  }, [loadDoctors, loadIncomingRequests, loadSentRequests]);

  useEffect(() => {
    if (audience === 'connections') {
      loadAcceptedConnections();
    }
  }, [audience, loadAcceptedConnections]);

  // Build the ID sets used to update cards consistently.
  const acceptedIds = useMemo(() => {
    const ids = new Set();

    acceptedConnections.forEach((connection) => {
      const doctor =
        connection.other_doctor ||
        connection.doctor ||
        connection.user ||
        connection;

      const id = doctorId(doctor);
      if (id != null) ids.add(String(id));
    });

    return ids;
  }, [acceptedConnections]);

  const pendingOutgoingIds = useMemo(() => {
    const ids = new Set();

    sentRequests.forEach((request) => {
      const id = doctorId(getOutgoingDoctor(request));
      if (id != null) ids.add(String(id));
    });

    return ids;
  }, [sentRequests]);

  const pendingIncomingIds = useMemo(() => {
    const ids = new Set();

    incomingRequests.forEach((request) => {
      const id = doctorId(getIncomingDoctor(request));
      if (id != null) ids.add(String(id));
    });

    return ids;
  }, [incomingRequests]);

  const specialties = useMemo(
    () => [
      ...new Set(
        doctors
          .map((doctor) => doctor.specialty || doctor.specialization)
          .filter(Boolean)
      ),
    ],
    [doctors]
  );

  const states = useMemo(
    () => [
      ...new Set(doctors.map((doctor) => doctor.state).filter(Boolean)),
    ],
    [doctors]
  );

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

      const id = String(doctorId(doctor) ?? '');

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
  }, [
    doctors,
    query,
    specialty,
    state,
    audience,
    acceptedIds,
  ]);

  function clearFilters() {
    setQuery('');
    setSpecialty('all');
    setState('all');
    setAudience('everyone');
  }

  // Send a request.
  async function handleConnect(doctor) {
    if (!getToken()) {
      navigate('/login');
      return;
    }

    const id = doctorId(doctor);
    const username = doctorUsername(doctor);

    if (id == null || !username) {
      setError('The doctor record is missing its ID or username.');
      return;
    }

    const idString = String(id);

    if (
      pendingOutgoingIds.has(idString) ||
      pendingIncomingIds.has(idString) ||
      acceptedIds.has(idString) ||
      doctor.connection_status === 'pending' ||
      doctor.connection_status === 'accepted'
    ) {
      return;
    }

    setSendingId(id);
    setError('');
    setNotice('');

    try {
      const data = await apiRequest('/connections/requests/', {
        method: 'POST',
        body: JSON.stringify({ username }),
      });

      setDoctors((current) =>
        current.map((item) =>
          String(doctorId(item)) === idString
            ? { ...item, connection_status: 'pending' }
            : item
        )
      );

      setNotice(
        data?.detail ||
          `Connection request sent to ${doctorName(doctor)}.`
      );

      // Reload from Django so Sent Requests reflects persisted data.
      await loadSentRequests();
    } catch (err) {
      setError(err.message || 'Could not send connection request.');
    } finally {
      setSendingId(null);
    }
  }

  // Withdraw a pending outgoing request.
  async function handleWithdrawRequest(request) {
    if (!request?.id || withdrawingId !== null) return;

    const confirmed = window.confirm(
      'Withdraw this connection request?'
    );

    if (!confirmed) return;

    const recipient = getOutgoingDoctor(request);
    const recipientId = doctorId(recipient);

    setWithdrawingId(request.id);
    setSentRequestsError('');
    setNotice('');

    try {
      await withdrawConnectionRequest(request.id);

      // Remove only after the backend confirms success.
      setSentRequests((current) =>
        current.filter(
          (item) => String(item.id) !== String(request.id)
        )
      );

      if (recipientId != null) {
        setDoctors((current) =>
          current.map((doctor) =>
            String(doctorId(doctor)) === String(recipientId)
              ? { ...doctor, connection_status: null }
              : doctor
          )
        );
      }

      setNotice('Connection request withdrawn.');
    } catch (err) {
      setSentRequestsError(
        err.message || 'Unable to withdraw the connection request.'
      );

      await loadSentRequests();
    } finally {
      setWithdrawingId(null);
    }
  }

  // Accept or reject an incoming request.
  async function handleRequestAction(request, action) {
    if (requestActionId !== null) return;

    setRequestActionId(request.id);
    setRequestError('');
    setRequestNotice('');

    try {
      await respondToConnectionRequest(request.id, action);

      setIncomingRequests((current) =>
        current.filter(
          (item) => String(item.id) !== String(request.id)
        )
      );

      if (action === 'accept') {
        await Promise.all([
          loadAcceptedConnections(),
          loadDoctors(),
        ]);

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

  function renderRequestCard(request, direction) {
    const doctor =
      direction === 'incoming'
        ? getIncomingDoctor(request)
        : getOutgoingDoctor(request);

    const name = doctorName(doctor);
    const image = doctorImage(doctor);
    const location = [doctor.city, doctor.state]
      .filter(Boolean)
      .join(', ');

    return (
      <article
        className="connection-request-card"
        key={request.id}
      >
        <div className="connection-request-card__avatar">
          {image ? (
            <img src={image} alt={name} />
          ) : (
            initials(name)
          )}
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

        {direction === 'incoming' ? (
          <div className="connection-request-card__actions">
            <button
              type="button"
              className="connection-request-card__accept"
              disabled={requestActionId !== null}
              onClick={() => handleRequestAction(request, 'accept')}
            >
              {requestActionId === request.id
                ? 'Please wait…'
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
        ) : (
          <div className="connection-request-card__actions">
            <span className="network-request-status">
              Requested
            </span>

            <button
              type="button"
              className="connection-request-card__withdraw"
              disabled={withdrawingId === request.id}
              onClick={() => handleWithdrawRequest(request)}
            >
              <X size={15} />
              {withdrawingId === request.id
                ? 'Withdrawing…'
                : 'Withdraw'}
            </button>
          </div>
        )}
      </article>
    );
  }

  function renderReceivedRequests() {
    return (
      <section
        className="connection-requests-panel"
        aria-label="Received connection requests"
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
              aria-label="Refresh received requests"
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
            Loading received requests…
          </p>
        ) : incomingRequests.length === 0 ? (
          <p className="connection-requests-panel__empty">
            No pending connection requests.
          </p>
        ) : (
          <div className="connection-requests-list">
            {incomingRequests.map((request) =>
              renderRequestCard(request, 'incoming')
            )}
          </div>
        )}
      </section>
    );
  }

  function renderSentRequests() {
    return (
      <section
        className="connection-requests-panel"
        aria-label="Sent connection requests"
      >
        <div className="connection-requests-panel__heading">
          <div>
            <p className="connection-requests-panel__eyebrow">
              YOUR NETWORK
            </p>
            <h2>Sent connection requests</h2>
          </div>

          <div className="connection-requests-panel__heading-actions">
            <span className="connection-requests-panel__count">
              {sentRequests.length}
            </span>

            <button
              type="button"
              className="connection-requests-panel__refresh"
              onClick={loadSentRequests}
              disabled={sentRequestsLoading}
              aria-label="Refresh sent requests"
            >
              <RefreshCw
                size={16}
                className={sentRequestsLoading ? 'is-spinning' : ''}
              />
            </button>
          </div>
        </div>

        {sentRequestsError && (
          <div className="connection-requests-panel__error" role="alert">
            <p>{sentRequestsError}</p>
            <button type="button" onClick={loadSentRequests}>
              Retry
            </button>
          </div>
        )}

        {notice && (
          <p className="connection-requests-panel__notice" role="status">
            {notice}
          </p>
        )}

        {sentRequestsLoading && sentRequests.length === 0 ? (
          <p className="connection-requests-panel__empty">
            Loading sent requests…
          </p>
        ) : sentRequests.length === 0 ? (
          <p className="connection-requests-panel__empty">
            You have no pending sent requests.
          </p>
        ) : (
          <div className="connection-requests-list">
            {sentRequests.map((request) =>
              renderRequestCard(request, 'outgoing')
            )}
          </div>
        )}
      </section>
    );
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

      <nav className="network-tabs" aria-label="Your network">
        <button
          type="button"
          className={activeTab === 'discover' ? 'is-active' : ''}
          onClick={() => setActiveTab('discover')}
        >
          <Users size={17} />
          Discover Vets
        </button>

        <button
          type="button"
          className={activeTab === 'received' ? 'is-active' : ''}
          onClick={() => {
            setActiveTab('received');
            loadIncomingRequests();
          }}
        >
          <UserCheck size={17} />
          Received Requests
          <span>{incomingRequests.length}</span>
        </button>

        <button
          type="button"
          className={activeTab === 'sent' ? 'is-active' : ''}
          onClick={() => {
            setActiveTab('sent');
            loadSentRequests();
          }}
        >
          <Send size={17} />
          Sent Requests
          <span>{sentRequests.length}</span>
        </button>
      </nav>

      {activeTab === 'discover' && (
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
            <p role="status">Loading veterinary professionals…</p>
          )}

          {!loading && !error && filteredDoctors.length > 0 && (
            <div className="vet-search-grid">
              {filteredDoctors.map((doctor, index) => {
                const name = doctorName(doctor);
                const username = doctorUsername(doctor);
                const id = doctorId(doctor) ?? username ?? index;
                const idString = String(id);

                const status = String(
                  doctor.connection_status || ''
                ).toLowerCase();

                const isSending =
                  String(sendingId) === idString;

                const isPending =
                  status === 'pending' ||
                  pendingOutgoingIds.has(idString);

                const isAccepted =
                  status === 'accepted' ||
                  doctor.is_connected === true ||
                  acceptedIds.has(idString);

                const isIncoming =
                  pendingIncomingIds.has(idString);

                const image = doctorImage(doctor);

                return (
                  <article className="vet-search-card" key={id}>
                    <div className="vet-search-card__banner">
                      <StethoscopeMark />
                      <span>
                        {doctor.city || 'Location not specified'}
                      </span>
                    </div>

                    <div className="vet-search-card__body">
                      <div className="vet-search-card__avatar">
                        {image ? (
                          <img src={image} alt={name} />
                        ) : (
                          initials(name)
                        )}
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
                          onClick={() =>
                            navigate(
                              `/doctors/${encodeURIComponent(username)}`
                            )
                          }
                        >
                          View page
                          <ArrowUpRight size={17} />
                        </button>

                        <button
                          type="button"
                          className={`vet-search-card__connect ${
                            isPending ? 'is-requested' : ''
                          }`}
                          disabled={
                            isSending ||
                            isAccepted ||
                            isIncoming
                          }
                          onClick={() => {
                            if (isPending) {
                              const request = sentRequests.find(
                                (item) =>
                                  String(
                                    doctorId(getOutgoingDoctor(item))
                                  ) === idString
                              );

                              if (request) {
                                handleWithdrawRequest(request);
                              } else {
                                setNotice(
                                  'Refresh Sent Requests to find this pending request.'
                                );
                              }
                            } else {
                              handleConnect(doctor);
                            }
                          }}
                        >
                          {isSending ? (
                            'Please wait…'
                          ) : isAccepted ? (
                            <>
                              <Check size={16} />
                              Connected
                            </>
                          ) : isPending ? (
                            <>
                              <X size={16} />
                              Withdraw
                            </>
                          ) : isIncoming ? (
                            'Respond'
                          ) : (
                            <>
                              <Plus size={19} />
                              Connect
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {!loading && !error && totalDoctors > PAGE_SIZE && (
            <nav
              className="network-pagination"
              aria-label="Doctor directory pages"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '18px',
                margin: '32px 0 12px',
                padding: '18px 20px',
                background: '#ffffff',
                border: '1px solid #d8e5dd',
                borderRadius: '16px',
                boxShadow: '0 8px 24px rgba(24, 53, 42, 0.06)',
              }}
            >
              <div style={{ minWidth: '150px' }}>
                <p style={{ margin: 0, color: '#18352a', fontSize: '13px', fontWeight: 700 }}>
                  Doctor directory
                </p>
                <p style={{ margin: '5px 0 0', color: '#66776e', fontSize: '12px' }}>
                  Showing {Math.min((currentPage - 1) * PAGE_SIZE + 1, totalDoctors)}–{Math.min(currentPage * PAGE_SIZE, totalDoctors)} of {totalDoctors} professionals
                </p>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexWrap: 'wrap',
                  gap: '6px',
                }}
              >
                <button
                  type="button"
                  aria-label="Go to previous page"
                  disabled={currentPage <= 1}
                  onClick={() => loadDoctors(undefined, currentPage - 1)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    minHeight: '40px',
                    padding: '0 13px',
                    border: '1px solid #d8e5dd',
                    borderRadius: '10px',
                    background: currentPage <= 1 ? '#f0f6f2' : '#ffffff',
                    color: currentPage <= 1 ? '#9aa9a0' : '#18352a',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: currentPage <= 1 ? 'not-allowed' : 'pointer',
                    transition: 'background 160ms ease, border-color 160ms ease',
                  }}
                >
                  <span aria-hidden="true">‹</span> Previous
                </button>

                {Array.from(
                  { length: Math.ceil(totalDoctors / PAGE_SIZE) },
                  (_, index) => index + 1
                ).map((page) => (
                  <button
                    key={page}
                    type="button"
                    aria-label={`Go to page ${page}`}
                    aria-current={currentPage === page ? 'page' : undefined}
                    disabled={loading || currentPage === page}
                    onClick={() => loadDoctors(undefined, page)}
                    style={{
                      width: '40px',
                      height: '40px',
                      border: currentPage === page ? '1px solid #18352a' : '1px solid transparent',
                      borderRadius: '10px',
                      background: currentPage === page ? '#18352a' : 'transparent',
                      color: currentPage === page ? '#ffffff' : '#476256',
                      fontSize: '13px',
                      fontWeight: currentPage === page ? 800 : 600,
                      cursor: currentPage === page || loading ? 'default' : 'pointer',
                      boxShadow: currentPage === page ? '0 4px 10px rgba(24, 53, 42, 0.18)' : 'none',
                      transition: 'background 160ms ease, color 160ms ease',
                    }}
                  >
                    {page}
                  </button>
                ))}

                <button
                  type="button"
                  aria-label="Go to next page"
                  disabled={currentPage >= Math.ceil(totalDoctors / PAGE_SIZE) || loading}
                  onClick={() => loadDoctors(undefined, currentPage + 1)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    minHeight: '40px',
                    padding: '0 13px',
                    border: '1px solid #18352a',
                    borderRadius: '10px',
                    background: currentPage >= Math.ceil(totalDoctors / PAGE_SIZE) ? '#f0f6f2' : '#18352a',
                    color: currentPage >= Math.ceil(totalDoctors / PAGE_SIZE) ? '#9aa9a0' : '#ffffff',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: currentPage >= Math.ceil(totalDoctors / PAGE_SIZE) || loading ? 'not-allowed' : 'pointer',
                    transition: 'background 160ms ease',
                  }}
                >
                  Next <span aria-hidden="true">›</span>
                </button>
              </div>
            </nav>
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
      )}

      {activeTab === 'received' && renderReceivedRequests()}
      {activeTab === 'sent' && renderSentRequests()}
    </main>
  );
}