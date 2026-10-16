import React, { useState } from "react";
import "./ReelsPage.css";

export default function ReelsPage({ posts = [], peopleToKnow = [], stories = [] }) {
  const [selectedReel, setSelectedReel] = useState(null);

  return (
    <div className="feed-page">
      <div className="feed-layout">
        <div className="left-sidebar">
          <div className="card profile-card">
            <div className="avatar"></div>
            <h3>Anand Kumar</h3>
            <p>Manager, Digital</p>
            <p className="small">Hyderabad, Telangana</p>
            <div className="company">
              <span className="dot" /> TCS
            </div>
          </div>
          <div className="card stats-card">
            <div className="stat"><span>3k</span><p>Impressions</p></div>
            <div className="stat"><span>50</span><p>Engagements</p></div>
            <div className="stat"><span>10</span><p>Reshares</p></div>
          </div>
        </div>

        <div className="middle-feed">
          <div className="card create-card">
            <div className="create-input">What's on your mind?</div>
            <div className="create-actions">
              <span>📷 Media</span>
              <span>📝 Article</span>
              <span>🎬 Short video</span>
            </div>
          </div>

          {posts.filter(p => p.type === "video").map((p) => (
            <div key={p.id} className="card post-card">
              <div className="post-header">
                <div className="post-avatar"></div>
                <div>
                  <b>{p.name}</b>
                  <p className="small">{p.role}</p>
                </div>
                <span className="follow">+ Follow</span>
              </div>
              <p className="post-text">{p.text}</p>
              <video 
                src={p.videoUrl} 
                className="post-media" 
                controls
                style={{cursor: 'pointer'}}
                onClick={() => setSelectedReel(p)}
              />
              <div className="post-actions">
                <span>❤️ {p.likes} Likes</span>
                <span>💬 {p.comments} Comments</span>
              </div>
            </div>
          ))}
        </div>

        <div className="right-sidebar">
          <div className="card stories-card">
            <h3>Stories</h3>
            {stories.map((s) => (
              <div key={s.id} className="story">
                <div className="story-avatar"></div>
                <p>{s.name}</p>
              </div>
            ))}
          </div>
          <div className="card people-card">
            <h3>People you may know</h3>
            {peopleToKnow.map((person) => (
              <div key={person.id} className="person">
                <div className="person-avatar"></div>
                <div>
                  <b>{person.name}</b>
                  <p className="small">{person.role}</p>
                </div>
                <button>Connect</button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {selectedReel && (
        <div className="reel-modal" onClick={() => setSelectedReel(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <video src={selectedReel.videoUrl} controls autoPlay style={{width: '100%', borderRadius: '12px'}} />
            <button onClick={() => setSelectedReel(null)} style={{width: '100%', padding: '12px', border: '0', fontWeight: 'bold', cursor: 'pointer'}}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}