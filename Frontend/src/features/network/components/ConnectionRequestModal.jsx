import { useState } from 'react';
import { X, UserRound, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { sendConnectionRequest } from '../api/NetworkApi';
import './ConnectionRequestModal.css';

export default function ConnectionRequestModal({ doctor, onClose, onSent }) {
  const [message, setMessage] = useState('Hi, I would like to connect with you on Zenve Vet.');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  if (!doctor) return null;
  const id = doctor.id ?? doctor.pk;
  const name = doctor.full_name || doctor.name || doctor.username || 'Veterinary Professional';
  const avatar = doctor.avatar || doctor.profile_picture || doctor.profile_image || doctor.image;

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    if (id == null) {
      setError('This profile does not have a valid user ID.');
      return;
    }
    setLoading(true);
    try {
      await sendConnectionRequest(id, message);
      setSent(true);
      onSent?.(doctor);
    } catch (err) {
      setError(err.message || 'Unable to send the connection request.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="connection-modal__backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="connection-modal" role="dialog" aria-modal="true" aria-labelledby="connection-modal-title">
        <button className="connection-modal__close" type="button" onClick={onClose} aria-label="Close"><X size={20} /></button>
        {!sent ? (
          <>
            <div className="connection-modal__icon"><Send size={23} /></div>
            <p className="connection-modal__eyebrow">VET NETWORK</p>
            <h2 id="connection-modal-title">Send connection request</h2>
            <p className="connection-modal__intro">Introduce yourself and start building your professional network.</p>
            <div className="connection-modal__person">
              {avatar ? <img src={avatar} alt="" /> : <span><UserRound size={22} /></span>}
              <div><strong>{name}</strong><small>{doctor.specialty || doctor.specialization || 'Veterinary Professional'}{doctor.city ? ` · ${doctor.city}` : ''}</small></div>
            </div>
            <form onSubmit={handleSubmit}>
              <label htmlFor="connection-message">Message <span>(optional)</span></label>
              <textarea id="connection-message" value={message} maxLength={300} onChange={(event) => setMessage(event.target.value)} rows={4} placeholder="Write a short introduction..." />
              <small className="connection-modal__counter">{message.length}/300</small>
              {error && <p className="connection-modal__error" role="alert"><AlertCircle size={16} />{error}</p>}
              <div className="connection-modal__actions">
                <button type="button" className="connection-modal__cancel" onClick={onClose}>Cancel</button>
                <button type="submit" className="connection-modal__send" disabled={loading}>{loading ? 'Sending…' : <><Send size={16} /> Send request</>}</button>
              </div>
            </form>
          </>
        ) : (
          <div className="connection-modal__success">
            <CheckCircle2 size={48} />
            <h2>Request sent!</h2>
            <p>Your connection request to <strong>{name}</strong> has been submitted.</p>
            <button className="connection-modal__send" type="button" onClick={onClose}>Done</button>
          </div>
        )}
      </section>
    </div>
  );
}
