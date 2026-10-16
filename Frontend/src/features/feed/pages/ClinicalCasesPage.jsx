
import { useState } from "react";
import {
  Heart,
  MessageCircle,
  Share2,
  ClipboardList,
  Stethoscope,
  Search,
  Filter,
  Plus,
  ArrowUpRight,
  Eye,
  RefreshCw,
  AlertCircle,
  UserRound,
  MapPin,
} from "lucide-react";

import useClinicalCases from "../hooks/useClinicalCases.js";
import "./FeedPage.css";
import "./ClinicalCasePage.css";

function ClinicalCasesHero() {
  return (
    <section className="clinical-hero">
      <div className="clinical-hero-content">
        <p className="clinical-eyebrow">
          THE ZENVE VET COMMUNITY
        </p>

        <h1>Clinical Cases. Shared Knowledge.</h1>

        <p>
          Explore veterinary cases, exchange professional insights,
          and learn from the experiences of your community.
        </p>

        <a href="#clinical-case-list" className="clinical-hero-link">
          Explore cases <ArrowUpRight size={16} />
        </a>
      </div>

      <div className="clinical-hero-icon">
        <Stethoscope size={48} strokeWidth={1.4} />
        <span>LEARN TOGETHER</span>
      </div>
    </section>
  );
}

function StoriesSection({ stories }) {
  return (
    <section className="white-card">
      <div className="head">
        <b>Moments from the community</b>
        <span>
          STORIES <ArrowUpRight size={14} />
        </span>
      </div>

      <div className="stories">
        <button
          type="button"
          className="story your-story"
          aria-label="Create your story"
        >
          <div className="ring add">
            <Plus size={22} />
          </div>
          <span>Your story</span>
        </button>

        {stories.map((story, index) => (
          <button
            type="button"
            key={story.id ?? `story-${index}`}
            className="story"
          >
            <div className="ring">
              <img
                src={story.avatar || "/default-avatar.png"}
                alt=""
              />
            </div>
            <span>{story.name || "Veterinarian"}</span>
          </button>
        ))}

        {stories.length === 0 && (
          <span className="empty-text">No stories yet</span>
        )}
      </div>
    </section>
  );
}

function CreatePostSection() {
  return (
    <section className="white-card">
      <button type="button" className="create-input">
        <Stethoscope size={20} />
        <span>
          Share a discovery, a case, a little inspiration...
        </span>
      </button>

      <div className="create-row">
        <div className="create-options">
          <button type="button">
            <ImageIcon size={17} />
            <span>Photo / Post</span>
          </button>

          <button type="button">
            <ClipboardList size={17} />
            <span>Clinical case</span>
          </button>

          <button type="button">
            <Plus size={17} />
            <span>Story</span>
          </button>

          <button type="button">
            <Video size={17} />
            <span>Short video</span>
          </button>

          <button type="button">
            <Sparkles size={17} />
            <span>AI case assistant</span>
          </button>
        </div>

        <button type="button" className="post-submit" disabled>
          Post <ArrowUpRight size={16} />
        </button>
      </div>
    </section>
  );
}

function FeedTabs({ tab, setTab }) {
  const tabs = ["For you", "Popular", "Following"];

  return (
    <div className="tabs">
      {tabs.map((item) => (
        <button
          key={item}
          type="button"
          className={tab === item ? "on" : ""}
          onClick={() => setTab(item)}
        >
          {item}
        </button>
      ))}

      <span className="community">
        <span className="status-dot" />
        COMMUNITY FEED
      </span>
    </div>
  );
}

function FeedFilters({ count }) {
  return (
    <div className="filter">
      <select
        defaultValue="all-specialties"
        aria-label="Filter by specialty"
      >
        <option value="all-specialties">All specialties</option>
      </select>

      <select
        defaultValue="all-states"
        aria-label="Filter by state"
      >
        <option value="all-states">All states</option>
      </select>

      <select
        defaultValue="all-posts"
        aria-label="Filter by post type"
      >
        <option value="all-posts">All posts</option>
      </select>

      <span>{count} RESULTS</span>
    </div>
  );
}

function PostCard({ post, index, isLiked, onToggleLike }) {
  const postId = post.id ?? `post-${index}`;
  const likesCount = Number(post.likes) || 0;

  return (
    <article className="white-card post-card">
      <div className="post-head">
        <img
          src={post.avatar || "/default-avatar.png"}
          alt=""
        />

        <div>
          <b>
            {post.name || post.author_name || "Veterinarian"}
          </b>
          <small>
            {post.role ||
              post.specialty ||
              "Veterinary professional"}
          </small>
        </div>
      </div>

      {post.text && (
        <p className="post-text">{post.text}</p>
      )}

      {post.title && (
        <h2 className="ad-title">{post.title}</h2>
      )}

      {post.image && (
        <img
          className="post-image"
          src={post.image}
          alt={post.title || "Post attachment"}
        />
      )}

      {post.type === "video" && post.videoUrl && (
        <video className="post-image" src={post.videoUrl} controls>
          Your browser does not support video playback.
        </video>
      )}

      <div className="consent">
        <ClipboardList size={15} />
        <span>
          Consent reviewed · De-identified for peer discussion
        </span>
      </div>

      <div className="stats">
        <span>
          <Eye size={15} />
          {post.views || 0} views
        </span>

        <span>
          <Heart size={15} />
          {likesCount + (isLiked ? 1 : 0)} likes
        </span>

        <span>
          <MessageCircle size={15} />
          {post.comments || 0} comments
        </span>

        <span>
          <Share2 size={15} />
          {post.shares || 0} shares
        </span>
      </div>

      <div className="actions">
        <button
          type="button"
          className={isLiked ? "action-btn liked" : "action-btn"}
          onClick={() => onToggleLike(postId)}
          aria-pressed={isLiked}
          aria-label={isLiked ? "Unlike post" : "Like post"}
        >
          <Heart
            size={20}
            strokeWidth={1.8}
            fill={isLiked ? "currentColor" : "none"}
            color={isLiked ? "#e53950" : "currentColor"}
          />

          <span>
            {isLiked ? "Appreciated" : "Appreciate"}
          </span>
        </button>

        <button type="button" className="action-btn">
          <MessageCircle size={18} />
          <span>Discuss</span>
        </button>

        <button type="button" className="action-btn">
          <Share2 size={18} />
          <span>Share</span>
        </button>

        <button
          type="button"
          className="action-btn"
          aria-label="Report post"
        >
          <Flag size={18} />
        </button>
      </div>
    </article>
  );
}

function PeopleToKnow({ people }) {
  return (
    <section className="right-card">
      <div className="head">
        <b>PEOPLE TO KNOW</b>
        <button type="button" className="text-link">
          View all <ArrowUpRight size={14} />
        </button>
      </div>

      {people.length === 0 ? (
        <p className="empty-text">No suggestions yet</p>
      ) : (
        people.map((person, index) => (
          <div
            key={person.id ?? `person-${index}`}
            className="person"
          >
            <img
              src={person.avatar || "/default-avatar.png"}
              alt=""
            />

            <div>
              <b>{person.name || "Veterinarian"}</b>
              <small>
                {person.spec || person.specialty || ""}
              </small>
              <small className="person-location">
                <MapPin size={12} />
                {person.city || "Location unavailable"}
              </small>
            </div>

            <button
              type="button"
              aria-label={`Connect with ${person.name || "veterinarian"}`}
            >
              <Plus size={18} />
            </button>
          </div>
        ))
      )}
    </section>
  );
}

function ZenveAdvantage() {
  return (
    <section className="right-card">
      <div className="head">
        <b>THE ZENVE ADVANTAGE</b>
        <Sparkles size={17} />
      </div>

      <div className="adv">
        <Globe size={20} />
        <div>
          <b>Your own professional page</b>
          <small>
            A place for your work, your voice, your professional identity.
          </small>
        </div>
        <ChevronRight size={17} />
      </div>

      <div className="adv">
        <Users size={20} />
        <div>
          <b>Meaningful connections</b>
          <small>
            Discover peers beyond your clinic and city.
          </small>
        </div>
        <ChevronRight size={17} />
      </div>

      <div className="adv">
        <Award size={20} />
        <div>
          <b>Grow with possibility</b>
          <small>
            Mentorship, research and innovation pathways.
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
      <h3>The next breakthrough could be yours.</h3>
      <p>A community built on care.</p>
      <a href="#feed-posts">
        Create your page <ArrowUpRight size={14} />
      </a>
    </section>
  );
}

export default function FeedPage({
  posts = [],
  peopleToKnow = [],
  stories = [],
}) {
  const [tab, setTab] = useState("For you");
  const [liked, setLiked] = useState([]);

  const safePosts = Array.isArray(posts) ? posts : [];
  const safeStories = Array.isArray(stories) ? stories : [];
  const safePeople = Array.isArray(peopleToKnow)
    ? peopleToKnow
    : [];

  const visiblePosts =
    tab === "Popular"
      ? [...safePosts].sort(
          (a, b) =>
            (Number(b.likes) || 0) -
            (Number(a.likes) || 0)
        )
      : safePosts;

  function toggleLike(postId) {
    setLiked((previous) =>
      previous.includes(postId)
        ? previous.filter((id) => id !== postId)
        : [...previous, postId]
    );
  }

  return (
    <div className="layout-center-right">
      <main className="center-feed">
        <HeroBanner />

        <StoriesSection stories={safeStories} />

        <CreatePostSection />

        <FeedTabs tab={tab} setTab={setTab} />

        <FeedFilters count={visiblePosts.length} />

        <div className="feed-list" id="feed-posts">
          {visiblePosts.length === 0 ? (
            <div className="white-card empty-feed">
              <p>No posts yet. Be the first to share.</p>
            </div>
          ) : (
            visiblePosts.map((post, index) => {
              const postId = post.id ?? `post-${index}`;

              return (
                <PostCard
                  key={postId}
                  post={post}
                  index={index}
                  isLiked={liked.includes(postId)}
                  onToggleLike={toggleLike}
                />
              );
            })
          )}
        </div>
      </main>

      <aside className="right-bar">
        <PeopleToKnow people={safePeople} />
        <ZenveAdvantage />
        <BreakthroughCard />
      </aside>
    </div>
  );
}
