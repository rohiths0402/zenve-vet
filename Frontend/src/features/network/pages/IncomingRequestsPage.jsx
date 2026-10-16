import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Check, Clock3, RefreshCw, UserRound, X, AlertCircle, Inbox } from 'lucide-react';
import { getConnectionRequests, respondToConnectionRequest } from '../api/NetworkApi';
import './IncomingRequestsPage.css';

function requestList(data) {
  if (Array.isArray(data)) return data;
  return data?.results || data?.requests || data?.data || [];
}

function displayName(request) {
  return request.sender_name || request.sender_full_name || request.sender_username ||
    (request.sender && typeof request.sender === 'object'
      ? request.sender.full_name || request.sender.username || request.sender.name
      : null) || `Veterinary professional #${request.sender ?? ''}`;
}

function avatarFor(request) {
  return request.sender_profile_picture || request.sender_avatar ||
    (request.sender && typeof request.sender === 'object'
      ? request.sender.profile_picture || request.sender.avatar || request.sender.image
      : null);
}

export default function IncomingRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);
  const [notice, setNotice] = useState('');

  const loadRequests = useCallback(async ({ quiet = false } = {}) => {
    if (quiet) setRefreshing(true); else setLoading(true);
    setError('');
    try {
      const data = await getConnectionRequests('received', 'pending');
      setRequests(requestList(data));
    } catch (err) {
      setError(err.message || 'Unable to load incoming connection requests.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadRequests(); }, [loadRequests]);

  async function handleRespond(request, action) {
    const id = request.id ?? request.pk;
    if (id == null) {
      setError('This request is missing its ID. Please refresh and try again.');
      return;
    }
    setBusyId(id); setError(''); setNotice('');
    try {
      await respondToConnectionRequest(id, action);
      setRequests(current => current.filter(item => (item.id ?? item.pk) !== id));
      setNotice(action === 'accept' ? 'Connection request accepted.' : 'Connection request rejected.');
    } catch (err) {
      setError(err.message || `Unable to ${action} this request.`);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <main className="incoming-page">
      <header className="incoming-hero">
        <Link className="incoming-back" to="/network"><ArrowLeft size={16} /> Vet Network</Link>
        <p className="incoming-eyebrow">ZENVE VET COMMUNITY</p>
        <div className="incoming-title-row">
          <div><h1>Incoming connection requests</h1><p>Review requests from other veterinary professionals.</p></div>
          <button className="incoming-refresh" type="button" onClick={() => loadRequests({ quiet: true })} disabled={refreshing || loading}>
            <RefreshCw size={16} className={refreshing ? 'is-spinning' : ''} /> {refreshing ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>
        <nav className="incoming-tabs" aria-label="Network requests">
          <Link to="/network">Discover vets</Link>
          <Link className="is-active" to="/network/requests">Received requests</Link>
          <Link to="/network/sent-requests">Sent requests</Link>
        </nav>
      </header>

      <section className="incoming-content" aria-live="polite">
        {error && <div className="incoming-alert incoming-alert--error"><AlertCircle size={18}/><span>{error}</span><button type="button" onClick={() => loadRequests()}>Try again</button></div>}
        {notice && <div className="incoming-alert incoming-alert--success">{notice}</div>}
        {loading ? <div className="incoming-state"><span className="incoming-loader"/><h2>Loading requests…</h2><p>Fetching your latest incoming requests.</p></div>
          : !error && requests.length === 0 ? <div className="incoming-state"><span className="incoming-empty-icon"><Inbox size={28}/></span><h2>No incoming requests yet</h2><p>When another vet sends you a connection request, it will appear here.</p><Link to="/network">Discover veterinary professionals</Link></div>
          : <div className="incoming-list">{requests.map((request, index) => {
            const id = request.id ?? request.pk ?? `${request.sender}-${index}`;
            const avatar = avatarFor(request);
            const name = displayName(request);
            return <article className="incoming-card" key={id}>
              <div className="incoming-avatar">{avatar ? <img src={avatar} alt=""/> : <UserRound size={24}/>}</div>
              <div className="incoming-person"><h2>{name}</h2><p>{request.sender_specialty || request.specialty || 'Veterinary Professional'}{request.sender_city || request.city ? ` · ${request.sender_city || request.city}` : ''}</p>{request.message && <blockquote>“{request.message}”</blockquote>}<span className="incoming-date"><Clock3 size={13}/>{request.created_at ? new Date(request.created_at).toLocaleDateString(undefined, {year:'numeric',month:'short',day:'numeric'}) : 'Connection request'}</span></div>
              <div className="incoming-actions"><button className="incoming-accept" type="button" disabled={busyId === (request.id ?? request.pk)} onClick={() => handleRespond(request, 'accept')}><Check size={16}/>{busyId === (request.id ?? request.pk) ? 'Please wait…' : 'Accept'}</button><button className="incoming-reject" type="button" disabled={busyId === (request.id ?? request.pk)} onClick={() => handleRespond(request, 'reject')}><X size={16}/> Reject</button></div>
            </article>;
          })}</div>}
      </section>
    </main>
  );
}
