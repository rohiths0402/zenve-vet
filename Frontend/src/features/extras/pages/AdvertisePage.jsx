import { useState } from 'react';
import { ArrowUpRight, Eye, KeyRound, Megaphone, ShieldCheck, Users, X, CheckCircle2 } from 'lucide-react';

const advertiseStyles = `

.advertise-page {
  box-sizing: border-box;
  
  width: calc(100% - 280px);
  min-width: 0;
  min-height: calc(100vh - 104px);
  margin-left: 280px;
  margin-top: 104px;
  padding: 24px 28px 60px;
  overflow-x: hidden;
  color: #18221d;
  font-family: inherit;
}
.advertise-page *, .advertise-page *::before, .advertise-page *::after { box-sizing: border-box; }

.advertise-hero {
  background: #07583d;
  color: #f8f0d9;
  border-radius: 28px;
  padding: 42px 40px 92px;
  min-height: 618px;
}
.advertise-eyebrow {
  margin: 0 0 14px;
  color: #d6b766;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: .28em;
}
.advertise-hero h1 {
  max-width: 1260px;
  margin: 0;
  color: #fff3d8;
  font-size: clamp(28px, 2.45vw, 44px);
  line-height: 1.2;
  font-weight: 700;
  letter-spacing: -.025em;
}
.advertise-intro {
  max-width: 760px;
  margin: 18px 0 28px;
  color: #d0e0d3;
  font-size: 17px;
  line-height: 1.65;
}
.advertise-benefits {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
}
.advertise-benefit {
  min-width: 0;
  min-height: 154px;
  padding: 20px 19px;
  border: 1px solid rgba(207, 183, 99, .36);
  border-radius: 21px;
  background: rgba(255,255,255,.075);
}
.advertise-benefit > svg {
  display: block;
  width: 26px;
  height: 26px;
  color: #d7b95f;
  stroke-width: 2;
  margin-bottom: 9px;
}
.advertise-benefit h2 {
  margin: 0 0 7px;
  color: #fff4df;
  font-size: 17px;
  line-height: 1.35;
  font-weight: 650;
}
.advertise-benefit p {
  margin: 0;
  color: #d0e0d3;
  font-size: 14.5px;
  line-height: 1.55;
}
.advertise-pricing {
  margin: 74px 0 0;
  text-align: center;
  color: #d0e0d3;
  font-size: 17px;
}
.advertise-pricing a { color: #d6b766; text-decoration: underline; text-underline-offset: 3px; }
.advertise-pricing a:hover { color: #fff3d8; }

.advertise-panels {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 20px;
  margin-top: 22px;
  align-items: stretch;
}
.advertise-panel {
  min-width: 0;
  min-height: 430px;
  padding: 24px 22px;
  border: 1px solid #e0e0d9;
  border-radius: 20px;
  background: #fff;
}
.advertise-panel h2 {
  margin: 0 0 20px;
  font-size: 19px;
  line-height: 1.35;
  color: #1c2520;
  font-weight: 550;
}
.advertise-panel label {
  display: block;
  margin: 0 0 8px;
  color: #727970;
  font-size: 13px;
}
.advertise-panel input {
  display: block;
  width: 100%;
  height: 48px;
  margin: 0 0 16px;
  padding: 0 15px;
  border: 1px solid #e0e0d8;
  border-radius: 5px;
  outline: none;
  background: #f7f6f1;
  color: #1d2922;
  font: inherit;
  font-size: 15px;
  transition: border-color .15s, box-shadow .15s;
}
.advertise-panel input::placeholder { color: #969991; opacity: 1; }
.advertise-panel input:focus {
  border-color: #0b6948;
  box-shadow: 0 0 0 2px rgba(11,105,72,.12);
}
.advertise-primary-button, .advertise-dashboard-button {
  width: 100%;
  min-height: 46px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  border-radius: 3px;
  cursor: pointer;
  font: inherit;
  font-size: 14px;
  transition: background .15s, border-color .15s, transform .15s;
}
.advertise-primary-button {
  border: 1px solid #e8d39d;
  background: #f5ebd0;
  color: #171c18;
}
.advertise-primary-button:hover { background: #ead7a6; }
.advertise-primary-button:active, .advertise-dashboard-button:active { transform: translateY(1px); }
.advertise-dashboard-button {
  border: 1px solid #e1dfd6;
  background: #f8f7f2;
  color: #202821;
  box-shadow: 0 2px 4px rgba(0,0,0,.08);
}
.advertise-dashboard-button:hover { background: #efeee7; border-color: #c9c7bb; }
.advertise-note { margin: 14px 0 0; color: #778078; font-size: 14px; }
.advertise-form-error { margin: -4px 0 12px; color: #b42318; font-size: 13px; line-height: 1.45; }

.advertise-modal-backdrop {
  position: fixed;
  top: 104px;
  right: 0;
  bottom: 0;
  left: 280px;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: rgba(14, 24, 18, .52);
}
.advertise-modal {
  position: relative;
  width: min(100%, 480px);
  max-height: min(82vh, 680px);
  overflow-y: auto;
  padding: 34px 32px 28px;
  border: 1px solid #e4e3dc;
  border-radius: 18px;
  background: #fff;
  box-shadow: 0 24px 80px rgba(0,0,0,.24);
  text-align: center;
}
.advertise-modal-close {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 38px;
  height: 38px;
  display: grid;
  place-items: center;
  border: 0;
  border-radius: 50%;
  background: transparent;
  color: #667069;
  cursor: pointer;
}
.advertise-modal-close:hover { background: #f2f3ef; }
.advertise-modal-icon {
  width: 54px;
  height: 54px;
  display: grid;
  place-items: center;
  margin: 0 auto 16px;
  border-radius: 50%;
  color: #0a6042;
  background: #e6f2e9;
}
.advertise-modal-icon.is-success { color: #18794e; background: #e1f5e9; }
.advertise-modal h2 { margin: 0 0 10px; color: #1d2821; font-size: 22px; line-height: 1.3; }
.advertise-modal p { margin: 0; color: #626d65; font-size: 15px; line-height: 1.65; }
.advertise-modal-ok { margin-top: 24px; }

@media (max-width: 760px) {
  .advertise-modal-backdrop {
    top: 76px;
    left: 0;
    padding: 16px;
  }
  .advertise-page {
    width: 100%;
    margin-left: 0;
    margin-top: 76px;
    min-height: calc(100vh - 76px);
    padding: 16px 14px 40px;
  }
}
@media (max-width: 1200px) {
  .advertise-hero { padding: 34px 30px 60px; min-height: auto; }
  .advertise-benefits { gap: 12px; }
  .advertise-benefit { padding: 17px 15px; }
  .advertise-pricing { margin-top: 48px; }
}
@media (max-width: 900px) {
  .advertise-benefits { grid-template-columns: 1fr; }
  .advertise-benefit { min-height: auto; }
  .advertise-panels { grid-template-columns: 1fr; }
  .advertise-panel { min-height: auto; }
}
@media (max-width: 560px) {
  .advertise-hero { padding: 27px 20px 38px; border-radius: 18px; }
  .advertise-eyebrow { font-size: 11px; letter-spacing: .2em; }
  .advertise-hero h1 { font-size: 29px; }
  .advertise-intro { font-size: 15px; }
  .advertise-pricing { margin-top: 32px; font-size: 14px; overflow-wrap: anywhere; }
  .advertise-panel { padding: 20px 16px; border-radius: 15px; }
  .advertise-modal { padding: 30px 20px 22px; }
}

`;

export default function AdvertisePage() {
  const [brand, setBrand] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [accessKey, setAccessKey] = useState('');
  const [modal, setModal] = useState(null);
  const [accountError, setAccountError] = useState('');
  const [dashboardError, setDashboardError] = useState('');

  const startAdvertising = (event) => {
    event.preventDefault();
    setAccountError('');
    if (!brand.trim() || !email.trim() || !website.trim()) {
      setAccountError('Please fill in your brand name, contact email, and website.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setAccountError('Please enter a valid contact email address.');
      return;
    }
    setModal({
      title: 'Advertiser request started',
      message: `Thanks, ${brand.trim()}. Your advertiser details are ready. The Zenve Vet team will review your campaign before it goes live.`,
      type: 'success',
    });
  };

  const openDashboard = (event) => {
    event.preventDefault();
    setDashboardError('');
    if (!accessKey.trim()) {
      setDashboardError('Please enter your advertiser access key.');
      return;
    }
    setModal({
      title: 'Dashboard access',
      message: 'Your access key has been entered. Dashboard sign-in will be available when the advertiser dashboard is connected.',
      type: 'info',
    });
  };

  return (
    <>
      <style>{advertiseStyles}</style>
      <main className="advertise-page">
      <section className="advertise-hero">
        <p className="advertise-eyebrow">ADVERTISE ON ZENVE VET</p>
        <h1>Reach India’s veterinary professionals where they share their work.</h1>
        <p className="advertise-intro">
          Your poster appears as a sponsored post inside the doctors’ feed — clearly labelled,
          reviewed by our team, measured with daily views and clicks.
        </p>

        <div className="advertise-benefits">
          <article className="advertise-benefit">
            <Users aria-hidden="true" />
            <h2>Doctors &amp; clinics</h2>
            <p>Small-animal, livestock, equine and research professionals across India.</p>
          </article>
          <article className="advertise-benefit">
            <ShieldCheck aria-hidden="true" />
            <h2>Reviewed before going live</h2>
            <p>Every campaign is checked by the Zenve Vet team, keeping the feed trustworthy.</p>
          </article>
          <article className="advertise-benefit">
            <Eye aria-hidden="true" />
            <h2>Transparent reports</h2>
            <p>Views, clicks and click-through rate by day and by campaign.</p>
          </article>
        </div>

        <p className="advertise-pricing">
          Pricing on request — write to{' '}
          <a href="mailto:zenvefashions@gmail.com">zenvefashions@gmail.com</a>.
        </p>
      </section>

      <section className="advertise-panels">
        <form className="advertise-panel" onSubmit={startAdvertising} noValidate>
          <h2>Create an advertiser account</h2>
          <label htmlFor="advertise-brand">Brand name</label>
          <input id="advertise-brand" value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="Your brand" autoComplete="organization" />
          <label htmlFor="advertise-email">Contact email</label>
          <input id="advertise-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@brand.com" autoComplete="email" />
          <label htmlFor="advertise-website">Website</label>
          <input id="advertise-website" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="brand.com" autoComplete="url" />
          {accountError && <p className="advertise-form-error" role="alert">{accountError}</p>}
          <button className="advertise-primary-button" type="submit">
            Start advertising <ArrowUpRight size={18} aria-hidden="true" />
          </button>
          <p className="advertise-note">No login needed. Free to set up.</p>
        </form>

        <form className="advertise-panel" onSubmit={openDashboard} noValidate>
          <h2>Already advertising?</h2>
          <label htmlFor="advertise-access-key">Paste your access key</label>
          <input id="advertise-access-key" value={accessKey} onChange={(e) => { setAccessKey(e.target.value); setDashboardError(''); }} placeholder="ZENVE-ADV:..." autoComplete="off" />
          {dashboardError && <p className="advertise-form-error" role="alert">{dashboardError}</p>}
          <button className="advertise-dashboard-button" type="submit">
            <KeyRound size={18} aria-hidden="true" /> Open dashboard
          </button>
          
        </form>
      </section>

      {modal && (
        <div className="advertise-modal-backdrop" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget) setModal(null); }}>
          <section className="advertise-modal" role="dialog" aria-modal="true" aria-labelledby="advertise-modal-title">
            <button className="advertise-modal-close" type="button" onClick={() => setModal(null)} aria-label="Close popup"><X size={20} /></button>
            <div className={`advertise-modal-icon ${modal.type === 'success' ? 'is-success' : ''}`}>
              {modal.type === 'success' ? <CheckCircle2 size={26} /> : <Megaphone size={26} />}
            </div>
            <h2 id="advertise-modal-title">{modal.title}</h2>
            <p>{modal.message}</p>
            <button className="advertise-primary-button advertise-modal-ok" type="button" onClick={() => setModal(null)}>Got it</button>
          </section>
        </div>
      )}
      </main>
    </>
  );
}
