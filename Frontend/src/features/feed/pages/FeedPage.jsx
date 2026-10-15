
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

function HeroBanner({ mode }) {
  const isClinical = mode === "clinical-cases";

  return (
    <div className="zenve-hero">
      <div className="hero-left">
        <p className="eyebrow">THE ZENVE VET COMMUNITY</p>

        <h1>
          {isClinical
            ? "Clinical cases. A new perspective."
            : "Every case. A new perspective."}
        </h1>

        <p className="sub">
          {isClinical
            ? "Explore veterinary cases and learn from the experiences of your community."
            : "Explore the knowledge and experiences of your community."}
        </p>

        <a className="cta" href="#feed-posts">
          {isClinical ? "Explore cases" : "Make your mark"}
          <ArrowUpRight size={16} />
        </a>
      </div>

      <div className="hero-right">
        <Stethoscope size={54} strokeWidth={1.4} />
        <span>
          BETTER
          <br />
          TOGETHER
        </span>
      </div>
    </div>
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

function CreatePostSection({ mode }) {
  const isClinical = mode === "clinical-cases";

  return (
    <section className="white-card">
      <button type="button" className="create-input">
        <Stethoscope size={20} />
        <span>
          {isClinical
            ? "Share a clinical case with your community..."
            : "Share a discovery, a case, a little inspiration..."}
        </span>
      </button>

      <div className="create-row">
        <div className="create-options">
          {isClinical ? (
            <>
              <button type="button">
                <ClipboardList size={17} />
                <span>Clinical case</span>
              </button>

              <button type="button">
                <ImageIcon size={17} />
                <span>Case images</span>
              </button>
            </>
          ) : (
            <>
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
            </>
          )}
        </div>

        <button type="button" className="post-submit" disabled>
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
        {mode === "clinical-cases"
          ? "CLINICAL CASES"
          : "COMMUNITY FEED"}
      </span>
    </div>
  );
}

function FeedFilters({ count, mode }) {
  return (
    <div className="filter">
      <select defaultValue="all-specialties" aria-label="Filter by specialty">
        <option value="all-specialties">All specialties</option>
      </select>

      <select defaultValue="all-states" aria-label="Filter by state">
        <option value="all-states">All states</option>
      </select>

      <select defaultValue="all-posts" aria-label="Filter by post type">
        <option value="all-posts">
          {mode === "clinical-cases" ? "All clinical cases" : "All posts"}
        </option>
      </select>

      <span>{count} RESULTS</span>
    </div>
  );
}

function PostCard({ post, index, isLiked, onToggleLike, mode }) {
  const postId = post.id ?? `${mode}-post-${index}`;
  const likesCount = Number(post.likes_count ?? post.likes) || 0;

  const isClinical = mode === "clinical-cases";

  const title = post.title || post.case_title;
  const description =
    post.text || post.description || post.content || post.summary;

  const author =
    post.name || post.author_name || post.doctor_name || "Veterinarian";

  const role =
    post.role || post.specialty || "Veterinary professional";

  const image =
    post.image || post.image_url || post.cover_image;

  const species = post.species || post.animal_species;
  const symptoms = post.symptoms || post.clinical_signs;
  const diagnosis = post.diagnosis || post.final_diagnosis;
  const treatment = post.treatment || post.treatment_plan;
  const outcome = post.outcome || post.case_outcome;

  return (
    <article className="white-card post-card">
      <div className="post-head">
        <img
          src={post.avatar || post.author_avatar || "/default-avatar.png"}
          alt=""
        />

        <div>
          <b>{author}</b>
          <small>{role}</small>
        </div>
      </div>

      {title && <h2 className="ad-title">{title}</h2>}

      {description && (
        <p className="post-text">{description}</p>
      )}

      {isClinical && (
        <div className="clinical-details">
          {species && (
            <p><b>Animal / Species:</b> {species}</p>
          )}
          {symptoms && (
            <p><b>Clinical signs:</b> {symptoms}</p>
          )}
          {diagnosis && (
            <p><b>Diagnosis:</b> {diagnosis}</p>
          )}
          {treatment && (
            <p><b>Treatment:</b> {treatment}</p>
          )}
          {outcome && (
            <p><b>Outcome:</b> {outcome}</p>
          )}
        </div>
      )}

      {image && (
        <img
          className="post-image"
          src={image}
          alt={title || "Post attachment"}
          loading="lazy"
        />
      )}

      {!isClinical &&
        post.type === "video" &&
        post.videoUrl && (
          <video className="post-image" src={post.videoUrl} controls>
            Your browser does not support video playback.
          </video>
        )}

      {isClinical && (
        <div className="consent">
          <ClipboardList size={15} />
          <span>
            Consent reviewed · De-identified for peer discussion
          </span>
        </div>
      )}

      <div className="stats">
        <span>
          <Eye size={15} />
          {post.views_count ?? post.views ?? 0} views
        </span>

        <span>
          <Heart size={15} />
          {likesCount + (isLiked ? 1 : 0)} likes
        </span>

        <span>
          <MessageCircle size={15} />
          {post.comments_count ?? post.comments ?? 0} comments
        </span>

        <span>
          <Share2 size={15} />
          {post.shares_count ?? post.shares ?? 0} shares
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
          />
          <span>{isLiked ? "Appreciated" : "Appreciate"}</span>
        </button>

        <button type="button" className="action-btn">
          <MessageCircle size={18} />
          <span>Discuss</span>
        </button>

        <button type="button" className="action-btn">
          <Share2 size={18} />
          <span>Share</span>
        </button>

        {!isClinical && (
          <button
            type="button"
            className="action-btn"
            aria-label="Report post"
          >
            <Flag size={18} />
          </button>
        )}
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
              <small>{person.spec || person.specialty || ""}</small>
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
          <small>Discover peers beyond your clinic and city.</small>
        </div>
        <ChevronRight size={17} />
      </div>

      <div className="adv">
        <Award size={20} />
        <div>
          <b>Grow with possibility</b>
          <small>Mentorship, research and innovation pathways.</small>
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
  mode = "feed",
}) {
  const [tab, setTab] = useState("For you");
  const [liked, setLiked] = useState([]);

  const safePosts = Array.isArray(posts) ? posts : [];
  const safeStories = Array.isArray(stories) ? stories : [];
  const safePeople = Array.isArray(peopleToKnow) ? peopleToKnow : [];

  const visiblePosts = safePosts.filter((post) => {
    if (mode !== "clinical-cases") return true;

    const type = String(post.type || post.post_type || "")
      .toLowerCase()
      .replace(/-/g, "_");

    return (
      type === "clinical_case" ||
      post.is_clinical_case === true
    );
  });

  const sortedPosts =
    tab === "Popular"
      ? [...visiblePosts].sort(
          (a, b) =>
            (Number(b.likes_count ?? b.likes) || 0) -
            (Number(a.likes_count ?? a.likes) || 0)
        )
      : visiblePosts;

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
        <HeroBanner mode={mode} />

        <StoriesSection stories={safeStories} />

        <CreatePostSection mode={mode} />

        <FeedTabs tab={tab} setTab={setTab} mode={mode} />

        <FeedFilters count={sortedPosts.length} mode={mode} />

        <div className="feed-list" id="feed-posts">
          {sortedPosts.length === 0 ? (
            <div className="white-card empty-feed">
              <p>
                {mode === "clinical-cases"
                  ? "No clinical cases available yet."
                  : "No posts yet. Be the first to share."}
              </p>
            </div>
          ) : (
            sortedPosts.map((post, index) => {
              const postId = post.id ?? `${mode}-post-${index}`;

              return (
                <PostCard
                  key={postId}
                  post={post}
                  index={index}
                  isLiked={liked.includes(postId)}
                  onToggleLike={toggleLike}
                  mode={mode}
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
