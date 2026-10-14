import { useState } from "react";
import "./FeedPage.css";

function HeroBanner({ onMakeMark }) {
  return (
    <div className="zenve-hero">
      <div className="hero-left">
        <p className="eyebrow">THE ZENVE VET COMMUNITY</p>
        <h1>A world of care. Connected.</h1>
        <p className="sub">Meet your peers. Share your practice. Move veterinary care forward.</p>
        <a className="cta" onClick={onMakeMark} style={{cursor:'pointer'}}>Make your mark <span>↗</span></a>
      </div>
      <div className="hero-right">
        <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
          <path d="M18 10C18 6 22 2 28 6C32 9 32 16 32 22V36C32 46 38 52 48 52C54 52 58 48 58 42C58 38 56 35 52 35C48 35 46 38 46 42" stroke="#C8B86A" strokeWidth="1.6" strokeLinecap="round"/>
          <circle cx="46" cy="42" r="2" fill="#C8B86A"/>
          <path d="M10 16C10 8 16 4 20 8" stroke="#C8B86A" strokeWidth="1.6" strokeLinecap="round"/>
          <circle cx="20" cy="28" r="3" stroke="#C8B86A" strokeWidth="1.6"/>
        </svg>
        <span>BETTER<br/>TOGETHER</span>
      </div>
    </div>
  );
}

function ModalWrapper({ open, onClose, children }) {
  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        {children}
      </div>
    </div>
  );
}

export default function FeedPage({ posts = [], peopleToKnow = [], stories = [] }) {
  const [tab, setTab] = useState("For you");
  const [activeModal, setActiveModal] = useState(null);
  const [allPosts, setAllPosts] = useState(posts);
  const [postText, setPostText] = useState("");
  const [fileName, setFileName] = useState("No file chosen");
  const [profile, setProfile] = useState({ name: "", city: "Bengaluru, Karnataka", specialty: "Small Animal Medicine", about: "" });

  const [openFilter, setOpenFilter] = useState(null);
  const [selectedSpecialty, setSelectedSpecialty] = useState("All specialties");
  const [selectedState, setSelectedState] = useState("All states");
  const [selectedPostType, setSelectedPostType] = useState("All posts");

  const specialtiesList = ["All specialties","Animal Nutrition","Cardiology","Diagnostic Imaging","Emergency & Critical Care","Equine Medicine","Livestock Health","Preventive Medicine","Small Animal Medicine","Surgeon","Surgery","TEST","Veterinary Dentistry","Veterinary Dermatology","Veterinary Diagnostics & Imaging","Veterinary Pathology","Veterinary Research","Veterinary Surgery","Wildlife Medicine"];
  const statesList = ["All states","Andhra Pradesh","Ariyalur","Assam","Bangalore","Bihar","Chandigarh","Chhattisgarh","Goa","Gujarat","Haryana","Himachal Pradesh","Jammu & Kashmir","Jharkhand","Karnataka","Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya"];
  const postsList = ["All posts","Posts & photos","Clinical cases","Stories","Short videos"];

  const tabs = ["For you", "Popular", "Following"];

  const addPost = (text) => {
    setAllPosts([{ id: Date.now(), name: "You", role: "Just now", avatar: "https://i.pravatar.cc/100?img=10", text, views: 1, likes: 0 },...allPosts]);
    setActiveModal(null);
    setPostText("");
    setFileName("No file chosen");
  };

  return (
    <div className="layout-center-right">
      <main className="center-feed">
        <HeroBanner onMakeMark={() => setActiveModal('profile')} />
        <div className="white-card">
          <div className="head"><b>Moments from the community</b><span>STORIES ↗</span></div>
          <div className="stories">
            <div className="story" onClick={() => setActiveModal('profile')} style={{cursor:'pointer'}}>
              <div className="ring add">+</div><span>Your story</span>
            </div>
            {stories.map(s => (<div key={s.id} className="story"><img src={s.avatar} alt="" /><span>{s.name}</span></div>))}
            {stories.length === 0 && <span className="empty-text">No stories yet</span>}
          </div>
        </div>
<div className="white-card">
  <input 
    className="create-input" 
    placeholder="🩺 Share a discovery, a case, a little inspiration..." 
    value={postText}
    onChange={(e) => setPostText(e.target.value)}
    onKeyDown={(e) => {
      if(e.key === 'Enter' && postText.trim()){
        addPost(postText);
      }
    }}
  />
  <div className="create-row">
    <div>
              <span className="create-btn" onClick={() => setActiveModal('post')}>🖼️ Photo / Post</span>
              <span className="create-btn" onClick={() => setActiveModal('clinical')}>📋 Clinical case</span>
              <span className="create-btn" onClick={() => setActiveModal('story')}>⊕ Story</span>
              <span className="create-btn" onClick={() => setActiveModal('video')}>🎬 Short video</span>
              <span className="create-btn" onClick={() => setActiveModal('ai')}>✨ AI case assistant</span>
            </div>
            <button onClick={() => setActiveModal('post')}>Post ↗</button>
          </div>
        </div>
        <div className="tabs">{tabs.map(t => (<button key={t} className={tab === t? "on" : ""} onClick={() => setTab(t)}>{t}</button>))}<span className="community">• COMMUNITY FEED</span></div>
        
        <div className="filter">
          <div className="custom-select-wrap">
            <button className="custom-select-btn" onClick={() => setOpenFilter(openFilter==='specialty'?null:'specialty')}>
              {selectedSpecialty} <span style={{fontSize:'10px'}}>▼</span>
            </button>
            {openFilter === 'specialty' && (
              <div className="custom-popup">
                {specialtiesList.map(item => (
                  <div key={item} onClick={() => { setSelectedSpecialty(item); setOpenFilter(null); }}>{item}</div>
                ))}
              </div>
            )}
          </div>

          <div className="custom-select-wrap">
            <button className="custom-select-btn" onClick={() => setOpenFilter(openFilter==='state'?null:'state')}>
              {selectedState} <span style={{fontSize:'10px'}}>▼</span>
            </button>
            {openFilter === 'state' && (
              <div className="custom-popup">
                {statesList.map(item => (
                  <div key={item} onClick={() => { setSelectedState(item); setOpenFilter(null); }}>{item}</div>
                ))}
              </div>
            )}
          </div>

          <div className="custom-select-wrap">
            <button className="custom-select-btn" onClick={() => setOpenFilter(openFilter==='post'?null:'post')}>
              {selectedPostType} <span style={{fontSize:'10px'}}>▼</span>
            </button>
            {openFilter === 'post' && (
              <div className="custom-popup small">
                {postsList.map(item => (
                  <div key={item} onClick={() => { setSelectedPostType(item); setOpenFilter(null); }}>{item}</div>
                ))}
              </div>
            )}
          </div>
          <span>{allPosts.length} RESULTS</span>
        </div>

        <div className="feed-list">{allPosts.map(p => (<div key={p.id} className="white-card post-card"><div className="post-head"><img src={p.avatar} alt="" /><div><b>{p.name}</b><small>{p.role}</small></div></div><p className="post-text">{p.text}</p><div className="consent">◎ Consent reviewed · De-identified for peer discussion</div></div>))}</div>
      </main>

      <aside className="right-bar">
        <div className="right-card">
          <div className="head"><b>PEOPLE TO KNOW</b><span>View all ↗</span></div>
          {peopleToKnow.length === 0? <p className="empty-text">No suggestions yet</p> : peopleToKnow.map(d => (
            <div key={d.id} className="person"><img src={d.avatar} alt="" /><div><b>{d.name}</b><small>{d.spec}</small><small>📍 {d.city}</small></div><button>+</button></div>
          ))}
        </div>

        <div className="right-card">
          <div className="head"><b>THE ZENVE ADVANTAGE</b><span>✧</span></div>
          <div className="adv">
            <div className="adv-icon">🌐</div>
            <div className="adv-text">
              <b>Your own professional page</b>
              <small>A place for your work, your voice, your professional identity.</small>
            </div>
            <span className="adv-arrow">›</span>
          </div>
          <div className="adv">
            <div className="adv-icon">👥</div>
            <div className="adv-text">
              <b>Meaningful connections</b>
              <small>Discover peers beyond your clinic and city.</small>
            </div>
            <span className="adv-arrow">›</span>
          </div>
          <div className="adv">
            <div className="adv-icon">🏅</div>
            <div className="adv-text">
              <b>Grow with possibility</b>
              <small>Mentorship, research and innovation pathways.</small>
            </div>
            <span className="adv-arrow">›</span>
          </div>
        </div>

        <div className="breakthrough"><h3>The next breakthrough could be yours.</h3><p>A community built on care.</p><small onClick={() => setActiveModal('profile')} style={{cursor:'pointer'}}>Create your page ↗</small></div>
      </aside>

      <ModalWrapper open={activeModal === 'profile'} onClose={() => setActiveModal(null)}>
        <h2>Make your professional mark.</h2>
        <p className="modal-sub">Your own public veterinary page. Free, with no login required.</p>
        <label>Full name</label><input placeholder="Dr. Your name" value={profile.name} onChange={e => setProfile({...profile, name: e.target.value })} />
        <label>City & state</label><input value={profile.city} onChange={e => setProfile({...profile, city: e.target.value })} />
        <label>Specialty</label><input value={profile.specialty} onChange={e => setProfile({...profile, specialty: e.target.value })} />
        <label>About you</label><textarea placeholder="Your approach to care, interests and professional story" rows="4" value={profile.about} onChange={e => setProfile({...profile, about: e.target.value })}></textarea>
        <p className="modal-note">Your page and posts are public and unverified. Publishing access stays in this browser; keep its data to retain access.</p>
        <button className="modal-create-btn" onClick={() => addPost(`Professional page: ${profile.name || 'Dr.'}`)}>Create my professional page ↗</button>
      </ModalWrapper>

      <ModalWrapper open={activeModal === 'post'} onClose={() => setActiveModal(null)}>
        <h2>Create Photo / Post</h2>
        <p className="modal-sub">Your own public post. Free, with no login required.</p>
        <label>Full name</label><input placeholder="Dr. Your name" />
        <label>City & state</label><input defaultValue="Bengaluru, Karnataka" />
        <label>Specialty</label><input defaultValue="Small Animal Medicine" />
        <label>About your case</label><textarea placeholder="Share a discovery, a case, a little inspiration..." rows="4" value={postText} onChange={e => setPostText(e.target.value)}></textarea>
        <p className="modal-note">Your post is public and unverified. Keep it de-identified and consent-reviewed.</p>
        <button className="modal-create-btn" onClick={() => addPost(postText || 'New Photo/Post shared')}>Post to community ↗</button>
      </ModalWrapper>

      <ModalWrapper open={activeModal === 'clinical'} onClose={() => setActiveModal(null)}>
        <h2>Share Clinical Case</h2>
        <p className="modal-sub">Your own public clinical case. Free, with no login required.</p>
        <label>Full name</label><input placeholder="Dr. Your name" />
        <label>City & state</label><input defaultValue="Bengaluru, Karnataka" />
        <label>Specialty</label><input defaultValue="Small Animal Medicine" />
        <label>About your case</label><textarea placeholder="De-identified history, findings, treatment and outcome..." rows="4"></textarea>
        <p className="modal-note">Ensure consent reviewed and de-identified for peer discussion.</p>
        <button className="modal-create-btn" onClick={() => addPost('Clinical case shared')}>Publish clinical case ↗</button>
      </ModalWrapper>

      <ModalWrapper open={activeModal === 'story'} onClose={() => setActiveModal(null)}>
        <h2>Create Story</h2>
        <p className="modal-sub">Visible for 24 hours. Free, with no login required.</p>
        <label>Full name</label><input placeholder="Dr. Your name" />
        <label>City & state</label><input defaultValue="Bengaluru, Karnataka" />
        <label>Specialty</label><input defaultValue="Small Animal Medicine" />
        <label>About your case</label><textarea placeholder="Add caption to your story..." rows="4"></textarea>
        <p className="modal-note">Your story is public for 24 hours and unverified.</p>
        <button className="modal-create-btn" onClick={() => addPost('New Story added')}>Add to story ↗</button>
      </ModalWrapper>

      <ModalWrapper open={activeModal === 'video'} onClose={() => setActiveModal(null)}>
        <h2>Upload Short Video</h2>
        <p className="modal-sub">Share small moments, big discoveries. Free, no login required.</p>
        <label>Full name</label><input placeholder="Dr. Your name" />
        <label>City & state</label><input defaultValue="Bengaluru, Karnataka" />
        <label>Specialty</label><input defaultValue="Small Animal Medicine" />
        <label>About your case</label><textarea placeholder="Context for your video..." rows="4"></textarea>
        <p className="modal-note">Your video is public and unverified.</p>
        <button className="modal-create-btn" onClick={() => addPost('Short video uploaded')}>Upload short video ↗</button>
      </ModalWrapper>

      <ModalWrapper open={activeModal === 'ai'} onClose={() => setActiveModal(null)}>
        <h2>AI Case Assistant ✨</h2>
        <p className="modal-sub">Your own AI-powered clinical support. Free, with no login required.</p>
        <label>Full name</label><input placeholder="Dr. Your name" />
        <label>City & state</label><input defaultValue="Bengaluru, Karnataka" />
        <label>Specialty</label><input defaultValue="Small Animal Medicine" />
        <label>About your case</label><textarea placeholder="Your approach to care, interests and professional story" rows="4"></textarea>
        <p className="modal-note">Your page and posts are public and unverified. AI suggestions are assistive only.</p>
        <button className="modal-create-btn" style={{ background: '#0F3D2E', color: '#fff' }}>Ask AI assistant ↗</button>
      </ModalWrapper>
    </div>
  );
}