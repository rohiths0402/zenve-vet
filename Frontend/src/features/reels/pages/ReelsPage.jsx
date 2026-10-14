import { useState } from "react";
import "./ReelsPage.css";

function HeroBanner() {
  return (
    <div className="zenve-hero">
      <div className="hero-left">
        <p className="eyebrow">THE ZENVE VET COMMUNITY</p>
        <h1>Small moments. Big discoveries.</h1>
        <p className="sub">Explore the knowledge and experiences of your community.</p>
        <a className="cta">Make your mark <span>↗</span></a>
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

export default function FeedPage({ posts = [], peopleToKnow = [], stories = [] }) {
  const [tab, setTab] = useState("For you");
  const [liked, setLiked] = useState([]);
  const tabs = ["For you", "Popular", "Following"];

  return (
    <div className="layout-center-right">
      <main className="center-feed">
        <HeroBanner />

        <div className="white-card">
          <div className="head"><b>Moments from the community</b><span>STORIES ↗</span></div>
          <div className="stories">
            <div className="story"><div className="ring add">+</div><span>Your story</span>
            </div>
            {}
            {(() => {
              const list = [];
              for (let i = 0; i < stories.length; i++) {
                const s = stories[i];
                list.push(
                  <div key={s.id} className="story">
                    <img src={s.avatar} alt={s.name} />
                    <span>{s.name}</span>
                  </div>
                );
              }
              return list;
            })()}
            {stories.length === 0 && <span className="empty-text">No stories yet</span>}
          </div>
        </div>

        <div className="white-card">
          <div className="create-input"><span>🩺</span> Share a discovery, a case, a little inspiration...
          </div>
          <div className="create-row">
            <div><span>🖼️ Photo / Post</span><span>📋 Clinical case</span>
            <span>⊕ Story</span><span>🎬 Short video</span>
            <span>✨ AI case assistant</span></div>
            <button>Post ↗</button>
          </div>
        </div>

        <div className="tabs">
          {}
          {(() => {
            const list = [];
            for (let i = 0; i < tabs.length; i++) {
              const t = tabs[i];
              list.push(
                <button key={t} className={tab === t? "on" : ""} onClick={() => setTab(t)}>
                  {t}
                </button>
              );
            }
            return list;
          })()}
          <span className="community">• COMMUNITY FEED</span>
        </div>

        <div className="filter">
          <select><option>All specialties</option></select>
          <select><option>All states</option></select>
          <select><option>All posts</option></select>
          <span>{posts.length} RESULTS</span>
        </div>

        <div className="feed-list">
          {posts.length === 0? (
            <div className="white-card empty-feed">
              <p>No posts yet. Be the first to share.</p>
            </div>
          ) : (
            
            (() => {
              const list = [];
              for (let i = 0; i < posts.length; i++) {
                const p = posts[i];
                list.push(
                  <div key={p.id} className="white-card post-card">
                    <div className="post-head">
                      <img src={p.avatar} alt="" />
                      <div><b>{p.name}</b><small>{p.role}</small></div>
                    </div>
                    {p.text && <p className="post-text">{p.text}</p>}
                    {p.title && <h2 className="ad-title">{p.title}</h2>}
                    {p.image && <img className="post-image" src={p.image} alt="" />}
                    {p.type === "video" && p.videoUrl && <video className="post-image" src={p.videoUrl} controls />}
                    <div className="consent">◎ Consent reviewed · De-identified for peer discussion</div>
                    <div className="stats">
                      <span>{p.views || 0} views</span>
                      <span>{p.likes || 0} likes</span>
                      <span>{p.comments || 0} comments</span>
                      <span>{p.shares || 0} shares</span>
                    </div>
                    <div className="actions">
                      <button onClick={() => setLiked(l => l.includes(p.id)? l.filter(x => x!== p.id) : [...l, p.id])}>
                        {liked.includes(p.id)? "❤️ Appreciate" : "♡ Appreciate"}
                      </button>
                      <button>○ Discuss</button><button>↗ Share</button><button>⚑</button>
                    </div>
                  </div>
                );
              }
              return list;
            })()
          )}
        </div>
      </main>

      <aside className="right-bar">
        <div className="right-card">
          <div className="head"><b>PEOPLE TO KNOW</b><span>View all ↗</span></div>
          {peopleToKnow.length === 0? (
            <p className="empty-text">No suggestions yet</p>
          ) : (
            
            (() => {
              const list = [];
              for (let i = 0; i < peopleToKnow.length; i++) {
                const d = peopleToKnow[i];
                list.push(
                  <div key={d.id} className="person">
                    <img src={d.avatar} alt="" />
                    <div><b>{d.name}</b><small>{d.spec}</small>
                    <small>📍 {d.city}</small></div>
                    <button>+</button>
                  </div>
                );
              }
              return list;
            })()
          )}
        </div>

        <div className="right-card">
          <div className="head"><b>THE ZENVE ADVANTAGE</b><span>✦</span></div>
          <div className="adv"><span>🌐</span><div><b>Your own professional page</b>
          <small>A place for your work, your voice, your professional identity.</small>
          </div><span>›</span></div>
          <div className="adv"><span>👥</span><div><b>Meaningful connections</b>
          <small>Discover peers beyond your clinic and city.</small></div>
          <span>›</span></div>
          <div className="adv"><span>🎖️</span><div><b>Grow with possibility</b>
          <small>Mentorship, research and innovation pathways.</small></div>
          <span>›</span></div>
        </div>

        <div className="breakthrough">
          <h3>The next breakthrough could be yours.</h3>
          <p>A community built on care.</p>
          <small>Create your page ↗</small>
        </div>
      </aside>
    </div>
  );
}