import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, MapPin, Pencil, Save, X, Stethoscope, ImagePlus } from 'lucide-react';
import './MyProfilePage.css';

const STORAGE_KEY = 'zenve-vet-my-profile-v1';
const DEFAULT_PROFILE = {
  name: 'Your name',
  title: 'Veterinarian',
  city: '',
  about: '',
  experience: '',
  qualifications: '',
  clinicName: '',
  clinicAddress: '',
  clinicPhone: '',
  profileImage: '',
  bannerImage: '',
};

function readProfile() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    return { ...DEFAULT_PROFILE, ...(stored || {}) };
  } catch {
    return DEFAULT_PROFILE;
  }
}

function ImageField({ label, value, onChange, banner = false }) {
  return (
    <label className={`mp-image-field ${banner ? 'mp-image-field--banner' : ''}`}>
      <span className="mp-image-field__preview">
        {value ? <img src={value} alt={`${label} preview`} /> : <ImagePlus size={22} />}
      </span>
      <span className="mp-image-field__copy">
        <strong>{label}</strong>
        <small>{banner ? 'Recommended: wide landscape image' : 'JPG, PNG or WebP'}</small>
        <span className="mp-image-field__button"><Camera size={14} /> Upload image</span>
      </span>
      <input
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (!file) return;
          if (file.size > 5 * 1024 * 1024) {
            window.alert('Please choose an image smaller than 5 MB.');
            event.target.value = '';
            return;
          }
          const reader = new FileReader();
          reader.onload = () => onChange(String(reader.result || ''));
          reader.readAsDataURL(file);
        }}
      />
    </label>
  );
}

export default function MyProfilePage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(readProfile);
  const [draft, setDraft] = useState(profile);
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(profile)); } catch { /* Browser storage can be full. */ }
  }, [profile]);

  const mapQuery = useMemo(
    () => [profile.clinicAddress, profile.city].filter(Boolean).join(', ').trim(),
    [profile.clinicAddress, profile.city]
  );
  const mapUrl = mapQuery
    ? `https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}&output=embed`
    : '';

  const startEditing = () => {
    setDraft({ ...profile });
    setSaved(false);
    setEditing(true);
  };
  const update = (key, value) => setDraft((current) => ({ ...current, [key]: value }));
  const save = (event) => {
    event.preventDefault();
    setProfile({ ...draft });
    setEditing(false);
    setSaved(true);
  };

  const initials = (profile.name || 'V').split(/\s+/).filter(Boolean).slice(0, 2).map((word) => word[0]).join('').toUpperCase();

  return (
    <main className="my-profile-page">
      <header className="mp-page-heading">
        <div>
          <p className="mp-eyebrow">ZENVE VET · PROFESSIONAL PROFILE</p>
          <h1>View profile</h1>
          <p className="mp-subtitle">Your professional identity and clinic details in one place.</p>
        </div>
        <button className="mp-button mp-button--primary" onClick={startEditing} type="button">
          <Pencil size={16} /> Edit profile
        </button>
      </header>

      {saved && <p className="mp-saved" role="status">Profile updated on this device.</p>}

      <section className="mp-profile-card">
        <div className="mp-banner" style={profile.bannerImage ? { backgroundImage: `url("${profile.bannerImage}")` } : undefined}>
          {!profile.bannerImage && <div className="mp-banner-pattern"><span>CARE</span><span>KNOWLEDGE</span><span>COMMUNITY</span></div>}
        </div>
        <div className="mp-identity">
          <div className="mp-avatar">
            {profile.profileImage ? <img src={profile.profileImage} alt={`${profile.name} profile`} /> : <span>{initials}</span>}
          </div>
          <div className="mp-identity-copy">
            <h2>{profile.name || 'Your name'}</h2>
            <p>{profile.title || 'Add your professional title'}</p>
            {(profile.city || profile.clinicName) && <span className="mp-location-line"><MapPin size={15} /> {[profile.clinicName, profile.city].filter(Boolean).join(' · ')}</span>}
          </div>
          <button type="button" className="mp-button mp-button--outline mp-desktop-edit" onClick={startEditing}><Pencil size={15} /> Edit</button>
        </div>
        <div className="mp-profile-content">
          <section className="mp-section">
            <h3>About</h3>
            <p className={profile.about ? '' : 'mp-muted'}>{profile.about || 'Add a short introduction about your veterinary experience and interests.'}</p>
          </section>
          <section className="mp-info-grid">
            <div><span>Experience</span><strong>{profile.experience || 'Not added yet'}</strong></div>
            <div><span>Qualifications</span><strong>{profile.qualifications || 'Not added yet'}</strong></div>
            <div><span>Location</span><strong>{profile.city || 'Not added yet'}</strong></div>
          </section>
        </div>
      </section>

      <section className="mp-clinic-card">
        <div className="mp-clinic-heading">
          <div className="mp-clinic-icon"><Stethoscope size={20} /></div>
          <div><p className="mp-eyebrow">YOUR PRACTICE</p><h2>{profile.clinicName || 'Add your clinic'}</h2></div>
          <button type="button" className="mp-button mp-button--outline" onClick={startEditing}><Pencil size={15} /> {profile.clinicName ? 'Edit clinic' : 'Add your clinic'}</button>
        </div>
        {profile.clinicName || profile.clinicAddress || profile.clinicPhone ? (
          <div className="mp-clinic-details">
            <div className="mp-clinic-copy">
              <h3>{profile.clinicName || 'Clinic details'}</h3>
              <p><MapPin size={16} /> {profile.clinicAddress || profile.city || 'Add your clinic address to show its location.'}</p>
              {profile.clinicPhone && <p>Phone: {profile.clinicPhone}</p>}
            </div>
            {mapUrl ? <iframe className="mp-map" title="Clinic location map" src={mapUrl} loading="lazy" referrerPolicy="no-referrer-when-downgrade" /> : <div className="mp-map-empty"><MapPin size={24} /><strong>Clinic map will appear here</strong><span>Add your clinic address when editing your profile.</span></div>}
          </div>
        ) : (
          <button type="button" className="mp-clinic-empty" onClick={startEditing}>
            <span className="mp-clinic-empty__icon"><MapPin size={23} /></span>
            <strong>Show clients and colleagues where your clinic is</strong>
            <span>Add your clinic name and address. A map preview will appear here automatically.</span>
            <span className="mp-text-link">Add clinic details <span aria-hidden="true">→</span></span>
          </button>
        )}
      </section>

      {editing && (
        <div className="mp-modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setEditing(false); }}>
          <section className="mp-modal" role="dialog" aria-modal="true" aria-labelledby="mp-edit-title">
            <header className="mp-modal-header">
              <div><p className="mp-eyebrow">MAKE IT YOURS</p><h2 id="mp-edit-title">Edit profile</h2><p>Update your profile photos, professional details and clinic location.</p></div>
              <button type="button" className="mp-icon-button" onClick={() => setEditing(false)} aria-label="Close edit profile"><X size={20} /></button>
            </header>
            <form onSubmit={save} className="mp-edit-form">
              <div className="mp-form-section">
                <h3>Profile images</h3>
                <div className="mp-upload-grid">
                  <ImageField label="Profile image" value={draft.profileImage} onChange={(value) => update('profileImage', value)} />
                  <ImageField label="Banner image" value={draft.bannerImage} onChange={(value) => update('bannerImage', value)} banner />
                </div>
                <p className="mp-help">Choose images up to 5 MB each. They are previewed and stored in this browser for now.</p>
              </div>
              <div className="mp-form-section">
                <h3>Professional details</h3>
                <div className="mp-form-grid">
                  <label className="mp-field"><span>Full name</span><input value={draft.name} onChange={(e) => update('name', e.target.value)} placeholder="Dr. Your Name" required /></label>
                  <label className="mp-field"><span>Professional title</span><input value={draft.title} onChange={(e) => update('title', e.target.value)} placeholder="Veterinarian / Surgeon" /></label>
                  <label className="mp-field"><span>City</span><input value={draft.city} onChange={(e) => update('city', e.target.value)} placeholder="City, state" /></label>
                  <label className="mp-field"><span>Experience</span><input value={draft.experience} onChange={(e) => update('experience', e.target.value)} placeholder="e.g. 5 years" /></label>
                  <label className="mp-field mp-field--full"><span>Qualifications</span><input value={draft.qualifications} onChange={(e) => update('qualifications', e.target.value)} placeholder="BVSc, MVSc..." /></label>
                  <label className="mp-field mp-field--full"><span>About you</span><textarea value={draft.about} onChange={(e) => update('about', e.target.value)} placeholder="Share your experience, interests and approach to veterinary care." rows={3} /></label>
                </div>
              </div>
              <div className="mp-form-section">
                <h3>Clinic details & location</h3>
                <div className="mp-form-grid">
                  <label className="mp-field mp-field--full"><span>Clinic name</span><input value={draft.clinicName} onChange={(e) => update('clinicName', e.target.value)} placeholder="Your clinic / hospital name" /></label>
                  <label className="mp-field mp-field--full"><span>Full clinic address</span><input value={draft.clinicAddress} onChange={(e) => update('clinicAddress', e.target.value)} placeholder="Street, area, city, postcode" /></label>
                  <label className="mp-field"><span>Clinic phone</span><input value={draft.clinicPhone} onChange={(e) => update('clinicPhone', e.target.value)} placeholder="Contact number" /></label>
                </div>
                {draft.clinicAddress || draft.city ? <div className="mp-map-preview"><p><MapPin size={15} /> Map preview</p><iframe title="Clinic map preview" src={`https://maps.google.com/maps?q=${encodeURIComponent([draft.clinicAddress, draft.city].filter(Boolean).join(', '))}&output=embed`} loading="lazy" /></div> : <p className="mp-help">Enter a clinic address to preview its map location.</p>}
              </div>
              <footer className="mp-modal-actions">
                <button type="button" className="mp-button mp-button--outline" onClick={() => setEditing(false)}>Cancel</button>
                <button type="submit" className="mp-button mp-button--primary"><Save size={16} /> Save changes</button>
              </footer>
            </form>
          </section>
        </div>
      )}
    </main>
  );
}
