import { useState } from "react";
import {
  Heart, 
  MessageCircle, 
  Share2, 
  ClipboardList, 
  Stethoscope, 
  Plus,
  ArrowUpRight, 
  Eye, 
  MapPin, 
  Image as ImageIcon,
   Video, 
   Sparkles,
  Flag, 
  Globe, 
  ChevronRight, 
  Users, 
  Award,
} from "lucide-react";
import "./FeedPage.css";

function ModalWrapper({ open, onClose, children })
 {
  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕

        </button>
        {children}
      </div>
    </div>
  );
}

function HeroBanner({ mode }) {
  const isClinical = mode === "clinical-cases";
  return (
    <div className="zenve-hero">
      <div className="hero-left">
        <p className="eyebrow">THE ZENVE VET COMMUNITY</p>
        <h1>{isClinical ? "Clinical cases. A new perspective." : "A world of care. Connected."}

        </h1>
        <p className="sub">{isClinical ? "Meet your peers. Share your practice. Move veterinary care forward." : "Explore the knowledge and experiences of your community."}

        </p>
        <a className="cta" href="#feed-posts">{isClinical ? "Explore cases" : "Make your mark"}
          <ArrowUpRight size={16} />
          </a>
      </div>
      <div className="hero-right">
        <Stethoscope size={54} strokeWidth={1.4} />
        <span>BETTER
          <br />TOGETHER</span>
          </div>
    </div>
  );
}

function StoriesSection({ stories, onCreateStory }) {
  return (
    <section className="white-card">
      <div className="head">
        <b>Moments from the community</b>
        <span>STORIES 
          <ArrowUpRight size={14} />
          </span>
          </div>
      <div className="stories">
        <button type="button" className="story your-story" onClick={onCreateStory} style={{cursor:'pointer'}}>
          <div className="ring add">
            <Plus size={22} />
            </div>
            <span>Your story</span>
        </button>
        {stories.map((story, index) => (
          <button type="button" key={story.id ?? `story-${index}`} className="story">
            <div className="ring">
              <img src={story.avatar || "/default-avatar.png"} alt="" />
            </div>
            <span>{story.name || "Veterinarian"}</span>
          </button>
        ))}
        {stories.length === 0 && <span className="empty-text">No stories yet</span>}
      </div>
    </section>
  );
}

function CreatePostSection({ mode, onOpen, discoveryText, setDiscoveryText, onCreatePost }) {
  const isClinical = mode === "clinical-cases";
  const hasText = discoveryText.trim().length > 0;
  return (
    <section className="white-card">
      <div className="create-input" style={{cursor:'text'}}>
        <Stethoscope size={20} />
        <input
          type="text"
          value={discoveryText}
          onChange={(e) => setDiscoveryText(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && hasText) onCreatePost(); }}
          placeholder={isClinical ? "Share a clinical case with your community..." : "Share a discovery, a case, a little inspiration..."}
          style={{border:'none', background:'transparent', outline:'none', width:'100%', fontSize:'13px', color:'#26352e', fontFamily:'inherit'}}
        />
      </div>
      <div className="create-row">
        <div className="create-options">
          {isClinical ? (
            <>
              <button type="button" onClick={() => onOpen('clinical')}>
                <ClipboardList size={17} />
                <span>Clinical case</span>
                </button>
              <button type="button" onClick={() => onOpen('post')}>
                <ImageIcon size={17} /><span>Case images</span>
                </button>
            </>
          ) : (
            <>
              <button type="button" onClick={() => onOpen('post')}>
                <ImageIcon size={17} />
                <span>Photo / Post</span>
                </button>
              <button type="button" onClick={() => onOpen('clinical')}>
                <ClipboardList size={17} />
                <span>Clinical case</span>
                </button>
              <button type="button" onClick={() => onOpen('story')}>
                <Plus size={17} />
                <span>Story</span>
                </button>
              <button type="button" onClick={() => onOpen('video')}>
                <Video size={17} />
                <span>Short video</span>
                </button>
              <button type="button" onClick={() => onOpen('ai')}>
                <Sparkles size={17} />
                <span>AI case assistant</span>
                </button>
            </>
          )}
        </div>
        <button type="button" className="post-submit" onClick={() => hasText ? onCreatePost() : onOpen('post')} disabled={false} style={{cursor:'pointer'}}>
          {isClinical ? "Share case" : "Post"}
          <ArrowUpRight size={16} />
        </button>
      </div>
    </section>
  );
}

function FeedTabs({ tab, setTab, mode }) {
  const tabs = ["For you", "Popular", "Following"];
  return (
    <div className="tabs">
      {tabs.map((item) => (
        <button key={item} type="button" className={tab === item ? "on" : ""} onClick={() => setTab(item)}>{item}
        </button>))
        }
      <span className="community">
        <span className="status-dot" />{mode === "clinical-cases" ? "CLINICAL CASES" : "COMMUNITY FEED"}</span>
    </div>
  );
}


function FeedFilters({ count, filters, setFilters, mode }) {
  const specialties = [
    "All specialties","Animal Nutrition","Cardiology","Diagnostic Imaging",
    "Emergency & Critical Care","Equine Medicine","Livestock Health",
    "Preventive Medicine","Small Animal Medicine","Surgeon","Surgery",
    "Veterinary Dentistry","Veterinary Dermatology","Veterinary Diagnostics & Imaging",
    "Veterinary Pathology","Veterinary Research","Veterinary Surgery","Wildlife Medicine"
  ];

  const states = [
    "All states","Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chandigarh",
    "Chhattisgarh","Goa","Gujarat","Haryana","Himachal Pradesh","Jammu & Kashmir",
    "Jharkhand","Karnataka","Kerala","Madhya Pradesh","Maharashtra","Manipur",
    "Meghalaya","Mizoram","Nagaland","Odisha","Punjab","Rajasthan","Sikkim",
    "Tamil Nadu","Telangana","Tripura","Uttar Pradesh","Uttarakhand","West Bengal",
    "Bangalore","Ariyalur"
  ];

  const postTypes = ["All posts","Posts & photos","Clinical cases","Stories","Short videos"];

  return (
    <div className="filter">
      <select value={filters.specialty} onChange={(e)=>setFilters({...filters, specialty:e.target.value})}>
        {specialties.map(s=>
        <option key={s} value={s}>{s}</option>)}
      </select>

      <select value={filters.state} onChange={(e)=>setFilters({...filters, state:e.target.value})}>
        {states.map(s=>
        <option key={s} value={s}>{s}
        </option>)}
      </select>

      <select value={filters.postType} onChange={(e)=>setFilters({...filters, postType:e.target.value})}>
        {postTypes.map(p=>
        <option key={p} value={p}>{p}
        </option>)}
      </select>

      <span>{count} RESULTS

      </span>
    </div>
  );
}

function PostCard({ post, index, isLiked, onToggleLike, mode }) {
  const postId = post.id ?? `${mode}-post-${index}`;
  const likesCount = Number(post.likes_count ?? post.likes) || 0;
  const isClinical = mode === "clinical-cases";
  const title = post.title || post.case_title;
  const description = post.text || post.description || post.content || post.summary;
  const author = post.name || post.author_name || post.doctor_name || "Veterinarian";
  const role = post.role || post.specialty || "Veterinary professional";
  const image = post.image || post.image_url || post.cover_image;
  return (
    <article className="white-card post-card">
      <div className="post-head">
        <img src={post.avatar || post.author_avatar || "/default-avatar.png"} alt="" />
        <div>
          <b>{author}
          </b>
          <small>{role}
            </small>
            </div>
            </div>
      {title && 
      <h2 className="ad-title">{title}
      </h2>}
      {description && <p className="post-text">{description}
        </p>
        }
      {image && 
      <img className="post-image" src={image} alt="" loading="lazy" />}
      <div className="stats">
        <span>
          <Eye size={15} />{post.views_count ?? post.views ?? 0} views
          </span>
          <span>
            <Heart size={15} />{likesCount + (isLiked ? 1 : 0)} likes
            </span>
            <span>
              <MessageCircle size={15} />{post.comments_count ?? post.comments ?? 0} comments
              </span>
              <span>
                <Share2 size={15} />{post.shares_count ?? post.shares ?? 0} shares
                </span>
                </div>
      <div className="actions">
        <button type="button" className={isLiked ? "action-btn liked" : "action-btn"} onClick={() => onToggleLike(postId)}>
          <Heart size={20} strokeWidth={1.8} fill={isLiked ? "currentColor" : "none"} />
          <span>{isLiked ? "Appreciated" : "Appreciate"}
            </span>
            </button>
        <button type="button" className="action-btn">
          <MessageCircle size={18} />
          <span>Discuss
            </span>
            </button>
        <button type="button" className="action-btn">
          <Share2 size={18} />
          <span>Share</span>
          </button>
        {!isClinical && 
        <button type="button" className="action-btn">
          <Flag size={18} />
          </button>}
      </div>
    </article>
  );
}
function PeopleToKnow({ people }) {
  return (
    <section className="right-card">
      <div className="head">
        <b>PEOPLE TO KNOW

        </b>
        <button type="button" className="text-link">View all
           <ArrowUpRight size={14} />
           </button>
           </div>
      {people.length === 0 ? 
      <p className="empty-text">No suggestions yet
      </p> : people.map((person, index) => 
        (
        <div key={person.id ?? `person-${index}`} className="person">
          <img src={person.avatar || "/default-avatar.png"} alt="" />
          <div>
            <b>{person.name || "Veterinarian"}
              </b>
              <small>{person.spec || person.specialty || ""}
                </small>
                <small className="person-location">
                  <MapPin size={12} />{person.city || "Location unavailable"}
                  </small>
                  </div>
                  <button type="button">
                    <Plus size={18} />
                    </button>
                    </div>))}
    </section>
  );
}
function ZenveAdvantage() {
  return (
    <section className="right-card">
      <div className="head">
        <b>THE ZENVE ADVANTAGE
          </b>
          <Sparkles size={17} />
          </div>
      <div className="adv">
        <Globe size={20} />
        <div>
          <b>Your own professional page
            </b>
            <small>A place for your work, your voice, your professional identity.
              </small>
              </div>
              <ChevronRight size={17} />
              </div>
      <div className="adv">
        <Users size={20} />
        <div>
          <b>Meaningful connections
            </b>
            <small>Discover peers beyond your clinic and city.
              </small>
              </div>
              <ChevronRight size={17} />
              </div>
      <div className="adv">
        <Award size={20} />
        <div>
          <b>Grow with possibility
            </b>
            <small>Mentorship, research and innovation pathways.
              </small>
              </div>
              <ChevronRight size={17} />
              </div>
    </section>
  );
}
function BreakthroughCard() {
  return (
  <section className="breakthrough">
    <h3>The next breakthrough could be yours.
      </h3><p>A community built on care.
        </p>
        <a href="#feed-posts">Create your page 
          <ArrowUpRight size={14} />
          </a>
          </section>);
}

export default function FeedPage({ posts = [], peopleToKnow = [], stories = [], mode = "feed" }) {
  const [tab, setTab] = useState("For you");
  const [liked, setLiked] = useState([]);
  const [activeModal, setActiveModal] = useState(null);
  const [postText, setPostText] = useState("");
  const [discoveryText, setDiscoveryText] = useState("");
  const [localPosts, setLocalPosts] = useState([]);
  const [filters, setFilters] = useState({ specialty:"All specialties", state:"All states", postType:"All posts" });

  const safePosts = Array.isArray(posts) ? posts : [];
  const safeStories = Array.isArray(stories) ? stories : [];
  const safePeople = Array.isArray(peopleToKnow) ? peopleToKnow : [];
  const allPosts = [...localPosts, ...safePosts];

  let visiblePosts = allPosts.filter((post) => {
    if (mode === "clinical-cases") {
      const type = String(post.type || post.post_type || "").toLowerCase().replace(/-/g, "_");
      if (!(type === "clinical_case" || post.is_clinical_case === true)) return false;
    }
    
    if (filters.specialty !== "All specialties") {
      const spec = (post.specialty || post.role || "").toLowerCase();
      if (!spec.includes(filters.specialty.toLowerCase())) return false;
    }
    
    if (filters.state !== "All states") {
      const city = (post.city || post.state || "").toLowerCase();
      if (filters.state !== "All states" && city && !city.includes(filters.state.toLowerCase())) {
      
      }
    }
    
    if (filters.postType !== "All posts") {
      const t = String(post.type || "").toLowerCase();
      if (filters.postType === "Clinical cases" && t !== "clinical_case") {
        if (!post.is_clinical_case) return false;
      }
      if (filters.postType === "Posts & photos" && t === "clinical_case") return false;
      if (filters.postType === "Stories" && t !== "story") return false;
      if (filters.postType === "Short videos" && t !== "video") return false;
    }
    
    if (discoveryText) {
      const q = discoveryText.toLowerCase();
      const title = (post.title || post.case_title || "").toLowerCase();
      const desc = (post.text || post.description || post.content || "").toLowerCase();
      if (!title.includes(q) && !desc.includes(q)) {
        
      }
    }
    return true;
  });

  const sortedPosts = tab === "Popular" ? [...visiblePosts].sort((a, b) => (Number(b.likes_count ?? b.likes) || 0) - (Number(a.likes_count ?? a.likes) || 0)) : visiblePosts;

  function toggleLike(postId) { setLiked((previous) => previous.includes(postId) ? previous.filter((id) => id !== postId) : [...previous, postId]); }
  function handleCreatePost() {
    if (!discoveryText.trim()) return;
    const newPost = { id:`local-${Date.now()}`, text:discoveryText, name:"You", role:"Veterinarian", avatar:"/default-avatar.png", likes_count:0, comments_count:0, shares_count:0, views_count:1, type:"post" };
    setLocalPosts(prev=>[newPost,...prev]);
    setDiscoveryText("");
  }

  return (
    <div className="layout-center-right">
      <main className="center-feed">
        <HeroBanner mode={mode} />
        <StoriesSection stories={safeStories} onCreateStory={() => setActiveModal('story')} />
        <CreatePostSection mode={mode} onOpen={(type)=>setActiveModal(type)} discoveryText={discoveryText} setDiscoveryText={setDiscoveryText} onCreatePost={handleCreatePost} />
        <FeedTabs tab={tab} setTab={setTab} mode={mode} />
        <FeedFilters count={sortedPosts.length} filters={filters} setFilters={setFilters} mode={mode} />
        <div className="feed-list" id="feed-posts">
          {sortedPosts.length === 0 ? (
            <div className="white-card empty-feed">
              <p>No results for selected filters.
            </p>
            </div>) : (sortedPosts.map((post, index) => { const postId = post.id ?? `${mode}-post-${index}`; return (
              <PostCard key={postId} post={post} index={index} isLiked={liked.includes(postId)} onToggleLike={toggleLike} mode={mode} />); }))}
        </div>
      </main>
      <aside className="right-bar">
        <PeopleToKnow people={safePeople} />
        <ZenveAdvantage />
        <BreakthroughCard />
        </aside>

      <ModalWrapper open={activeModal === 'post'} onClose={() => setActiveModal(null)}>
        <h2 className="popup-title">Create Photo / Post

        </h2>
        <p className="modal-sub">Your own public post. Free, with no login required.

        </p>
        <label>FULL NAME
          </label>
          <input className="popup-input" placeholder="Dr. Your name" />
        <label>CITY & STATE
          </label>
          <input className="popup-input" defaultValue="Bengaluru, Karnataka" />
        <label>SPECIALTY
          </label>
          <input className="popup-input" defaultValue="Small Animal Medicine" />
        <label>ABOUT YOUR CASE
          </label>
          <textarea className="popup-input" placeholder="Share a discovery, a case, a little inspiration..." rows="4" value={postText} onChange={e=>setPostText(e.target.value)}>

          </textarea>
        <p className="modal-note">Your post is public and unverified. Keep it de-identified and consent-reviewed.

        </p>
        <button className="popup-btn" onClick={() => setActiveModal(null)}>Post to community ↗

        </button>
      </ModalWrapper>

      <ModalWrapper open={activeModal === 'story'} onClose={() => setActiveModal(null)}>
        <h2 className="popup-title">Create Story

        </h2>
        <p className="modal-sub">Visible for 24 hours. Free, with no login required.

        </p>
        <label>FULL NAME
          </label>
          <input className="popup-input" placeholder="Dr. Your name" />
        <label>CITY & STATE
          </label>
          <input className="popup-input" defaultValue="Bengaluru, Karnataka" />
        <label>SPECIALTY
          </label>
          <input className="popup-input" defaultValue="Small Animal Medicine" />
        <label>ABOUT YOUR STORY
          </label>
          <textarea className="popup-input" placeholder="Add caption to your story..." rows="4">

          </textarea>
        <p className="modal-note">Your story is public for 24 hours and unverified.

        </p>
        <button className="popup-btn" onClick={() => setActiveModal(null)}>Add to story ↗

        </button>
      </ModalWrapper>

      <ModalWrapper open={activeModal === 'clinical'} onClose={() => setActiveModal(null)}>
        <h2 className="popup-title">Share Clinical Case

        </h2>
        <p className="modal-sub">Your own public clinical case. Free, with no login required.

        </p>
        <label>FULL NAME
          </label>
          <input className="popup-input" placeholder="Dr. Your name" />
        <label>CITY & STATE
          </label>
          <input className="popup-input" defaultValue="Bengaluru, Karnataka" />
        <label>SPECIALTY
          </label>
          <input className="popup-input" defaultValue="Small Animal Medicine" />
        <label>ABOUT YOUR CASE
          </label>
          <textarea className="popup-input" placeholder="De-identified history, findings, treatment and outcome..." rows="4">

          </textarea>
        <p className="modal-note">Ensure consent reviewed and de-identified for peer discussion.

        </p>
        <button className="popup-btn" onClick={() => setActiveModal(null)}>Publish clinical case ↗

        </button>
      </ModalWrapper>

      <ModalWrapper open={activeModal === 'video'} onClose={() => setActiveModal(null)}>
        <h2 className="popup-title">Upload Short Video

        </h2>
        <p className="modal-sub">Share small moments, big discoveries. Free, no login required.

        </p>
        <label>FULL NAME
          </label>
          <input className="popup-input" placeholder="Dr. Your name" />
        <label>CITY & STATE
          </label>
          <input className="popup-input" defaultValue="Bengaluru, Karnataka" />
        <label>SPECIALTY
          </label>
          <input className="popup-input" defaultValue="Small Animal Medicine" />
        <label>ABOUT YOUR CASE
          </label>
          <textarea className="popup-input" placeholder="Context for your video..." rows="4">

          </textarea>
        <p className="modal-note">Your video is public and unverified.

        </p>
        <button className="popup-btn" onClick={() => setActiveModal(null)}>Upload short video ↗

        </button>
      </ModalWrapper>

      <ModalWrapper open={activeModal === 'ai'} onClose={() => setActiveModal(null)}>
        <h2 className="popup-title">AI Case Assistant ✨

        </h2>
        <p className="modal-sub">Your own AI-powered clinical support. Free, with no login required.

        </p>
        <label>FULL NAME

        </label>
        <input className="popup-input" placeholder="Dr. Your name" />
        <label>CITY & STATE
          </label>
          <input className="popup-input" defaultValue="Bengaluru, Karnataka" />
        <label>SPECIALTY
          </label>
          <input className="popup-input" defaultValue="Small Animal Medicine" />
        <label>ABOUT YOUR CASE
          </label>
          <textarea className="popup-input" placeholder="Your approach to care, interests and professional story" rows="4">

          </textarea>
        <p className="modal-note">AI suggestions are assistive only.

        </p>
        <button className="popup-btn" onClick={() => setActiveModal(null)}>Ask AI assistant ↗
          
        </button>
      </ModalWrapper>
    </div>
  );
}