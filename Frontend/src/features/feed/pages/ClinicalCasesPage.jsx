import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
  Video,
  Sparkles,
  Globe,
  ChevronRight,
  Users,
  Award,
  LoaderCircle,
  RefreshCw,
  X,
} from "lucide-react";

import "./FeedPage.css";
import CreatePostCard from "../components/CreatorPostCard.jsx";
import useFeed from "../hooks/useFeed.js";
import useStories from "../hooks/useStories.js";
import useAuthSession from '../../../shared/hooks/useAuthSession'
import {
  createFeedPost,
  likeFeedPost,
  unlikeFeedPost,
} from "../service/feedService.js";

function getStoryExpiry(story) {
  const createdAt =
    story?.created_at ??
    story?.createdAt ??
    story?.published_at ??
    story?.publishedAt;

  if (!createdAt) return null;

  const timestamp = new Date(createdAt).getTime();

  return Number.isNaN(timestamp)
    ? null
    : timestamp + 24 * 60 * 60 * 1000;
}


function getStoryId(story) {
  return story?.id ?? story?.pk ?? story?.uuid ?? null;
}

function getPostId(post) {
  return post?.id ?? post?.pk;
}

function getPostContent(post) {
  return (
    post?.caption ||
    post?.content ||
    post?.text ||
    post?.description ||
    post?.summary ||
    ""
  );
}

function getAuthorName(post) {
  return (
    post?.author_full_name ||
    post?.author_name ||
    post?.author?.full_name ||
    post?.author?.fullName ||
    post?.author?.username ||
    post?.name ||
    post?.doctor_name ||
    "Veterinarian"
  );
}

function getAuthorUsername(post) {
  const author = post?.author && typeof post.author === "object" ? post.author : {};
  const user = post?.user && typeof post.user === "object" ? post.user : {};
  const username =
    post?.author_username ||
    post?.username ||
    author?.username ||
    user?.username ||
    post?.doctor?.username ||
    "";

  return typeof username === "string" ? username.trim() : "";
}


function resolveBackendUrl(value) {
  if (!value || typeof value !== "string") return "";
  const url = value.trim();
  if (!url) return "";
  if (/^(https?:|data:|blob:)/i.test(url)) return url;
  if (url.startsWith("//")) return `${window.location.protocol}${url}`;

  const apiBase = (
    import.meta.env.VITE_API_BASE_URL ||
    "http://127.0.0.1:8000/api"
  ).replace(/\/+$/, "");
  const backendBase = apiBase.replace(/\/api\/?$/i, "");
  return `${backendBase}/${url.replace(/^\/+/, "")}`;
}

function getAuthorAvatar(post) {
  const author =
    post?.author && typeof post.author === "object" ? post.author :
    post?.user && typeof post.user === "object" ? post.user : {};

  const value =
    post?.author_avatar ||
    post?.author_profile_photo_url ||
    author?.profile_photo_url ||
    author?.profile_photo ||
    author?.profile_picture ||
    author?.avatar_url ||
    author?.avatar ||
    post?.profile_photo_url ||
    post?.profile_picture ||
    post?.avatar_url ||
    post?.avatar ||
    author?.doctor_profile?.profile_photo_url ||
    "";

  return resolveBackendUrl(value);
}

function getStoryMediaUrl(story) {
  return resolveBackendUrl(
    story?.media_url || story?.mediaUrl || story?.image_url ||
    story?.image || story?.photo_url || story?.file_url || story?.media || ""
  );
}

function getStoryOwnerId(story) {
  const author = story?.author && typeof story.author === "object" ? story.author : {};
  const user = story?.user && typeof story.user === "object" ? story.user : {};
  const id = story?.author_id ?? story?.user_id ?? story?.doctor_id ??
    author?.id ?? author?.user_id ?? user?.id ?? user?.user_id ??
    story?.author_username ?? author?.username ?? user?.username;
  // Do not group records with no identifiable owner together.
  return id == null ? `story:${getStoryId(story) ?? "unknown"}` : String(id);
}

function groupStoriesByDoctor(stories) {
  const groups = new Map();
  for (const story of stories) {
    const ownerId = getStoryOwnerId(story);
    if (!groups.has(ownerId)) groups.set(ownerId, []);
    groups.get(ownerId).push(story);
  }
  return Array.from(groups.entries()).map(([ownerId, items]) => ({ ownerId, stories: items }));
}

function getPostType(post) {
  return String(
    post?.content_type || post?.post_type || post?.type || "post"
  )
    .toLowerCase()
    .replace(/-/g, "_");
}

function getMediaUrl(post) {
  return resolveBackendUrl(
    post?.media_url || post?.image_url || post?.image || post?.cover_image || ""
  );
}

function getCount(value) {
  if (Array.isArray(value)) return value.length;
  return Number(value) || 0;
}

function getErrorMessage(error) {
  return error?.message || "Something went wrong. Please try again.";
}

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

function StoriesSection({ storyGroups, loading, onCreateStory, onOpenStory }) {
  return (
    <section className="white-card">
      <div className="head">
        <b>Moments from the community</b>
        <span>STORIES <ArrowUpRight size={14} /></span>
      </div>
      <div className="stories">
        <button type="button" className="story your-story" aria-label="Create your story" onClick={onCreateStory}>
          <div className="ring add"><Plus size={22} /></div>
          <span>Your story</span>
        </button>
        {storyGroups.map((group, index) => {
          const latest = group.stories[group.stories.length - 1];
          const author = latest?.author && typeof latest.author === "object" ? latest.author :
            latest?.user && typeof latest.user === "object" ? latest.user : {};
          const name = author.full_name || author.fullName || author.name || author.username ||
            latest?.author_full_name || latest?.author_username || latest?.doctor_name || "Veterinarian";
          const avatar = getAuthorAvatar(latest);
          return (
            <button type="button" key={group.ownerId} className="story" onClick={() => onOpenStory(index)} aria-label={`View ${name}'s stories`}>
              <div className="ring">
                {avatar ? <img src={avatar} alt={`${name}'s profile`} onError={(event) => { event.currentTarget.style.display = "none"; }} /> : <span>{name.charAt(0).toUpperCase()}</span>}
              </div>
              <span>{name}</span>
            </button>
          );
        })}
        {!loading && storyGroups.length === 0 && <span className="empty-text">No stories yet</span>}
        {loading && <span className="empty-text">Loading stories...</span>}
      </div>
    </section>
  );
}

function FeedTabs({ tab, setTab, mode, followingAvailable }) {
  const tabs = ["For you", "Popular", "Following"];

  return (
    <div className="tabs">
      {tabs.map((item) => (
        <button
          key={item}
          type="button"
          className={tab === item ? "on" : ""}
          onClick={() => setTab(item)}
          aria-pressed={tab === item}
          title={
            item === "Following" && !followingAvailable
              ? "Following feed requires available connection data"
              : undefined
          }
        >
          {item}
        </button>
      ))}

      <span className="community">
        <span className="status-dot" />
        {mode === "clinical-cases" ? "CLINICAL CASES" : "COMMUNITY FEED"}
      </span>
    </div>
  );
}

function FeedFilters({
  posts,
  specialty,
  setSpecialty,
  postType,
  setPostType,
  count,
  mode,
}) {
  const specialties = useMemo(
    () =>
      [
        ...new Set(
          posts
            .map(
              (post) =>
                post.specialty ||
                post.author_specialty ||
                post.author?.specialty
            )
            .filter(Boolean)
        ),
      ].sort(),
    [posts]
  );

  const postTypes = useMemo(
    () => [...new Set(posts.map(getPostType).filter(Boolean))].sort(),
    [posts]
  );

  return (
    <div className="filter">
      <select
        value={specialty}
        onChange={(event) => setSpecialty(event.target.value)}
        aria-label="Filter by specialty"
      >
        <option value="all-specialties">All specialties</option>
        {specialties.map((item) => (
          <option value={item} key={item}>
            {item}
          </option>
        ))}
      </select>

      <select
        value={postType}
        onChange={(event) => setPostType(event.target.value)}
        aria-label="Filter by post type"
      >
        <option value="all-posts">
          {mode === "clinical-cases" ? "All clinical cases" : "All posts"}
        </option>
        {postTypes.map((item) => (
          <option value={item} key={item}>
            {item.replace(/_/g, " ")}
          </option>
        ))}
      </select>

      <span>{count} RESULTS</span>
    </div>
  );
}

function PostCard({
  post,
  index,
  isLiked,
  likePending,
  onToggleLike,
  onDiscuss,
  onShare,
  mode,
}) {
  const type = getPostType(post);
  const isClinical =
    mode === "clinical-cases" ||
    type === "case" ||
    type === "clinical_case";

  const title = post.title || post.case_title;
  const description = getPostContent(post);
  const author = getAuthorName(post);
  const authorUsername = getAuthorUsername(post);
  const authorProfilePath = authorUsername
    ? `/doctors/${encodeURIComponent(authorUsername)}`
    : null;
  const role =
    post.author_specialty ||
    post.specialty ||
    post.author?.specialty ||
    post.role ||
    "Veterinary professional";

  const media = getMediaUrl(post);
  const likesCount = getCount(post.likes_count ?? post.likes);
  const commentsCount = getCount(post.comments_count ?? post.comments);

  return (
    <article className="white-card post-card">
      <div className="post-head">
        {authorProfilePath ? (
          <Link
            to={authorProfilePath}
            className="post-author-avatar-link"
            style={{ color: "inherit", textDecoration: "none" }}
            aria-label={`View ${author}'s profile`}
            title={`View ${author}'s profile`}
          >
            {getAuthorAvatar(post) ? (
              <img
                src={getAuthorAvatar(post)}
                alt=""
                onError={(event) => {
                  event.currentTarget.style.display = "none";
                }}
              />
            ) : (
              <span className="post-avatar-fallback">
                {author.charAt(0).toUpperCase()}
              </span>
            )}
          </Link>
        ) : getAuthorAvatar(post) ? (
          <img
            src={getAuthorAvatar(post)}
            alt={`${author}'s profile`}
            onError={(event) => {
              event.currentTarget.style.display = "none";
            }}
          />
        ) : (
          <span className="post-avatar-fallback">{author.charAt(0).toUpperCase()}</span>
        )}
        <div className="post-author-details">
          {authorProfilePath ? (
            <Link
              to={authorProfilePath}
              className="post-author-name-link"
              style={{ color: "inherit", textDecoration: "none" }}
              aria-label={`View ${author}'s profile`}
            >
              <b>{author}</b>
            </Link>
          ) : (
            <b>{author}</b>
          )}
          <small>{role}</small>
        </div>
      </div>

      {title && <h2 className="ad-title">{title}</h2>}
      {description && <p className="post-text">{description}</p>}

      {isClinical && (
        <div className="clinical-details">
          {post.species && <p><b>Animal / Species:</b> {post.species}</p>}
          {post.symptoms && <p><b>Clinical signs:</b> {post.symptoms}</p>}
          {post.diagnosis && <p><b>Diagnosis:</b> {post.diagnosis}</p>}
          {post.treatment && <p><b>Treatment:</b> {post.treatment}</p>}
          {post.outcome && <p><b>Outcome:</b> {post.outcome}</p>}
        </div>
      )}

      {media && type !== "video" && (
        <img
          className="post-image"
          src={media}
          alt={title || "Post attachment"}
          loading="lazy"
        />
      )}

      {type === "video" && media && (
        <video className="post-image" src={media} controls>
          Your browser does not support video playback.
        </video>
      )}

      {isClinical && (
        <div className="consent">
          <ClipboardList size={15} />
          <span>Clinical case · Verify patient consent and de-identification</span>
        </div>
      )}

      <div className="stats">
        <span><Eye size={15} /> {post.views_count ?? post.views ?? 0} views</span>
        <span><Heart size={15} /> {likesCount} likes</span>
        <span><MessageCircle size={15} /> {commentsCount} comments</span>
        <span><Share2 size={15} /> {post.shares_count ?? post.shares ?? 0} shares</span>
      </div>

      <div className="actions">
        <button
          type="button"
          className={isLiked ? "action-btn liked" : "action-btn"}
          onClick={() => onToggleLike(post)}
          disabled={likePending}
          aria-pressed={isLiked}
        >
          {likePending ? (
            <LoaderCircle size={19} />
          ) : (
            <Heart size={20} fill={isLiked ? "currentColor" : "none"} />
          )}
          <span>{isLiked ? "Appreciated" : "Appreciate"}</span>
        </button>

        <button type="button" className="action-btn" onClick={() => onDiscuss(post)}>
          <MessageCircle size={18} />
          <span>Discuss</span>
        </button>

        <button type="button" className="action-btn" onClick={() => onShare(post)}>
          <Share2 size={18} />
          <span>Share</span>
        </button>
      </div>
    </article>
  );
}

function PeopleToKnow({ people, onViewAll }) {
  return (
    <section className="right-card">
      <div className="head">
        <b>PEOPLE TO KNOW</b>
        <button type="button" className="text-link" onClick={onViewAll}>View all</button>
      </div>
      {people.length === 0 ? <p className="empty-text">No suggestions yet</p> : (
        people.slice(0, 3).map((person, index) => {
          const name = person.name || person.full_name || person.fullName || person.username || "Veterinarian";
          const avatar = resolveBackendUrl(person.profile_photo_url || person.profile_picture || person.avatar_url || person.avatar || "");
          return (
            <div key={person.id ?? person.user_id ?? person.username ?? `person-${index}`} className="person">
              {avatar ? <img src={avatar} alt={`${name}'s profile`} onError={(event) => { event.currentTarget.style.display = "none"; }} /> : <span className="person-avatar-fallback">{name.charAt(0).toUpperCase()}</span>}
              <div>
                <b>{name}</b>
                <small>{person.spec || person.specialty || person.professional_title || ""}</small>
                <small className="person-location"><MapPin size={12} />{person.city || "Location unavailable"}</small>
              </div>
            </div>
          );
        })
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
          <small>A place for your work, your voice, your professional identity.</small>
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

export default function ClinicalCasesPage({
  posts: providedPosts,
  peopleToKnow = [],
  stories: providedStories,
  mode = "feed",
}) {
  const navigate = useNavigate();
  const isAuthenticated = useAuthSession()
  const {
    posts: fetchedPosts,
    loading: feedLoading,
    error: feedLoadError,
    refresh: refreshFeed,
  } = useFeed();

  const {
    stories: fetchedStories,
    loading: storiesLoading,
    error: storiesError,
    refresh: refreshStories,
  } = useStories();

  const [tab, setTab] = useState("For you");
  const [likedIds, setLikedIds] = useState(() => new Set());
  const [pendingLikes, setPendingLikes] = useState(() => new Set());
  const [specialty, setSpecialty] = useState("all-specialties");
  const [postType, setPostType] = useState("all-posts");
  const [actionError, setActionError] = useState("");
  const [actionNotice, setActionNotice] = useState("");
  const [selectedStoryIndex, setSelectedStoryIndex] = useState(null);
  const [storyUploadOpen, setStoryUploadOpen] = useState(false);
  const [storyCaption, setStoryCaption] = useState("");
  const [storyFile, setStoryFile] = useState(null);
  const [storyPreviewUrl, setStoryPreviewUrl] = useState("");
  const [storySubmitting, setStorySubmitting] = useState(false);
  const [videoPreview, setVideoPreview] = useState(null);

  useEffect(() => {
    if (!storyFile) {
      setStoryPreviewUrl("");
      return undefined;
    }

    const url = URL.createObjectURL(storyFile);
    setStoryPreviewUrl(url);

    return () => URL.revokeObjectURL(url);
  }, [storyFile]);

  const safePosts = Array.isArray(providedPosts) && providedPosts.length
    ? providedPosts
    : fetchedPosts;

  const safeStories = useMemo(() => {
    const source =
      Array.isArray(providedStories) && providedStories.length
        ? providedStories
        : fetchedStories;

    const now = Date.now();
    const seen = new Set();

    return (Array.isArray(source) ? source : []).filter((story) => {
      const expiry = getStoryExpiry(story);
      if (expiry !== null && expiry <= now) return false;

      const id = getStoryId(story);
      if (id !== null) {
        const key = String(id);
        if (seen.has(key)) return false;
        seen.add(key);
      }

      return true;
    });
  }, [providedStories, fetchedStories]);

  const storyGroups = useMemo(() => groupStoriesByDoctor(safeStories), [safeStories]);
  const orderedStories = useMemo(
    () => storyGroups.flatMap((group) => group.stories),
    [storyGroups]
  );
  const storyGroupStartIndices = useMemo(() => {
    let offset = 0;
    return storyGroups.map((group) => {
      const start = offset;
      offset += group.stories.length;
      return start;
    });
  }, [storyGroups]);

  const safePeople = Array.isArray(peopleToKnow) ? peopleToKnow : [];

  const visiblePosts = useMemo(() => {
    let result = safePosts;

    if (mode === "clinical-cases") {
      result = result.filter((post) => {
        const type = getPostType(post);
        return type === "case" || type === "clinical_case";
      });
    }

    if (specialty !== "all-specialties") {
      result = result.filter(
        (post) =>
          (post.specialty || post.author_specialty || post.author?.specialty) === specialty
      );
    }

    if (postType !== "all-posts") {
      result = result.filter((post) => getPostType(post) === postType);
    }

    if (tab === "Popular") {
      result = [...result].sort(
        (a, b) =>
          getCount(b.likes_count ?? b.likes) -
          getCount(a.likes_count ?? a.likes)
      );
    }

    return result;
  }, [safePosts, mode, specialty, postType, tab]);

  const handleCreatePost = useCallback(
    async (content) => {
      setActionError("");
      setActionNotice("");

      if (!localStorage.getItem("zenveAccessToken")) {
        throw new Error("Please sign in before creating a post.");
      }

      await createFeedPost({
        content_type: "post",
        caption: content,
        is_published: true,
      });

      await refreshFeed();
      setActionNotice("Your post was published.");
    },
    [refreshFeed]
  );

  const handleCreateStory = useCallback(
    async (image, caption) => {
      setActionError("");
      setActionNotice("");

      if (!localStorage.getItem("zenveAccessToken")) {
        throw new Error("Please sign in before uploading a story.");
      }

      const { createStory } = await import("../service/storyService.js");
      await createStory({ image, caption });
      await refreshStories();

      setActionNotice("Your story was uploaded.");
      setStoryUploadOpen(false);
      setStoryFile(null);
      setStoryCaption("");
    },
    [refreshStories]
  );

  async function handleToggleLike(post) {
    const postId = getPostId(post);

    if (postId == null) {
      setActionError("This post has no server ID and cannot be liked.");
      return;
    }

    if (pendingLikes.has(postId)) return;

    if (!localStorage.getItem("zenveAccessToken")) {
      setActionError("Please sign in to appreciate a post.");
      return;
    }

    const wasLiked = likedIds.has(postId);
    setPendingLikes((current) => new Set(current).add(postId));
    setActionError("");
    setActionNotice("");

    try {
      if (wasLiked) {
        await unlikeFeedPost(postId);
      } else {
        await likeFeedPost(postId);
      }

      setLikedIds((current) => {
        const next = new Set(current);
        if (wasLiked) next.delete(postId);
        else next.add(postId);
        return next;
      });

      await refreshFeed();
    } catch (error) {
      setActionError(getErrorMessage(error));
    } finally {
      setPendingLikes((current) => {
        const next = new Set(current);
        next.delete(postId);
        return next;
      });
    }
  }

  async function handleShare(post) {
    const postId = getPostId(post);
    const shareUrl = postId
      ? `${window.location.origin}/posts/${postId}`
      : window.location.href;

    try {
      if (navigator.share) {
        await navigator.share({
          title: post.title || "Zenve Vet community post",
          text: getPostContent(post),
          url: shareUrl,
        });
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
        setActionNotice("Post link copied.");
      } else {
        window.prompt("Copy this post link:", shareUrl);
      }
    } catch (error) {
      if (error.name !== "AbortError") {
        setActionError("Unable to share this post.");
      }
    }
  }

  function handleDiscuss(post) {
    const postId = getPostId(post);
    if (!postId) {
      setActionError("This post has no server ID.");
      return;
    }
    navigate(`/posts/${postId}#comments`);
  }

  function handleStoryFileChange(event) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setActionError("Please select an image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setActionError("Story images must not exceed 5 MB.");
      return;
    }

    setStoryFile(file);
    setStoryUploadOpen(true);
    setActionError("");
    setActionNotice("");
  }

  async function submitStory(event) {
    event.preventDefault();

    if (!storyFile) {
      setActionError("Choose an image for your story.");
      return;
    }

    setStorySubmitting(true);

    try {
      await handleCreateStory(storyFile, storyCaption);
    } catch (error) {
      setActionError(getErrorMessage(error));
    } finally {
      setStorySubmitting(false);
    }
  }

  function handleVideoChange(event) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    if (!file.type.startsWith("video/")) {
      setActionError("Please select a video file.");
      return;
    }

    const url = URL.createObjectURL(file);
    setVideoPreview({ file, url });
    setActionError("");
    setActionNotice(
      "Video preview is ready. Publishing requires a verified video-upload endpoint."
    );
  }

  function closeVideoPreview() {
    if (videoPreview?.url) URL.revokeObjectURL(videoPreview.url);
    setVideoPreview(null);
  }

  return (
    <div className="layout-center-right">
      <main className="center-feed">
        <HeroBanner mode={mode} />

        <StoriesSection
          storyGroups={storyGroups}
          loading={storiesLoading}
          onCreateStory={() => document.getElementById("zenve-story-upload")?.click()}
          onOpenStory={(groupIndex) => setSelectedStoryIndex(storyGroupStartIndices[groupIndex] ?? null)}
        />

        <input
          id="zenve-story-upload"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          hidden
          onChange={handleStoryFileChange}
        />

        {isAuthenticated && (
  <CreatePostCard
    mode={mode}
    onCreatePost={handleCreatePost}
    onCreateStory={handleCreateStory}
    onOpenClinicalCase={() => navigate('/clinical-cases')}
    onOpenVideo={() =>
      document.getElementById('zenve-video-upload')?.click()
    }
  />
)}

        <input
          id="zenve-video-upload"
          type="file"
          accept="video/*"
          hidden
          onChange={handleVideoChange}
        />

        {storyUploadOpen && (
          <div
            className="story-modal-overlay"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) {
                setStoryUploadOpen(false);
                setStoryFile(null);
              }
            }}
          >
            <section
              className="story-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="story-modal-title"
            >
              <div className="story-modal-header">
                <h2 id="story-modal-title">Create story</h2>
                <button
                  type="button"
                  className="story-modal-close"
                  onClick={() => {
                    setStoryUploadOpen(false);
                    setStoryFile(null);
                    setStoryCaption("");
                  }}
                  aria-label="Close story form"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="story-preview">
                {storyPreviewUrl ? (
                  <img src={storyPreviewUrl} alt="Story preview" />
                ) : (
                  <p>Choose an image to preview your story.</p>
                )}
              </div>

              <form onSubmit={submitStory}>
                <label htmlFor="zenve-story-caption">
                  Caption (optional)
                </label>
                <textarea
                  id="zenve-story-caption"
                  value={storyCaption}
                  onChange={(event) => setStoryCaption(event.target.value)}
                  maxLength={1000}
                  rows={3}
                />

                <button
                  className="post-submit"
                  type="submit"
                  disabled={storySubmitting || !storyFile}
                >
                  {storySubmitting ? "Uploading..." : "Publish story"}
                </button>
              </form>
            </section>
          </div>
        )}

        {selectedStoryIndex !== null && orderedStories[selectedStoryIndex] && (
          <div className="story-modal-overlay" onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelectedStoryIndex(null);
          }}>
            <section className="story-modal story-viewer-modal" role="dialog" aria-modal="true" aria-label="Story viewer">
              <div className="head">
                <b>{getAuthorName(orderedStories[selectedStoryIndex])}</b>
                <button type="button" className="action-btn" onClick={() => setSelectedStoryIndex(null)} aria-label="Close story"><X size={18} /></button>
              </div>
              {getStoryMediaUrl(orderedStories[selectedStoryIndex]) && (
                <img className="post-image" src={getStoryMediaUrl(orderedStories[selectedStoryIndex])} alt={orderedStories[selectedStoryIndex].caption || "Story"} />
              )}
              <p>{orderedStories[selectedStoryIndex].caption}</p>
              <div className="actions">
                <button type="button" className="action-btn" disabled={selectedStoryIndex === 0} onClick={() => setSelectedStoryIndex((index) => index - 1)}>Previous</button>
                <button type="button" className="action-btn" disabled={selectedStoryIndex >= orderedStories.length - 1} onClick={() => setSelectedStoryIndex((index) => index + 1)}>Next</button>
              </div>
            </section>
          </div>
        )}

        {videoPreview && (
          <div className="story-modal-overlay">
            <section
              className="story-modal"
              role="dialog"
              aria-modal="true"
              aria-label="Video preview"
            >
              <div className="story-modal-header">
                <h2>Video preview</h2>
                <button
                  type="button"
                  className="story-modal-close"
                  onClick={closeVideoPreview}
                  aria-label="Close video preview"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="story-preview">
                <video
                  src={videoPreview.url}
                  controls
                  autoPlay
                  className="composer-preview"
                />
              </div>

              <p>
                {videoPreview.file.name} — preview only. Video publishing
                requires a backend upload endpoint.
              </p>
            </section>
          </div>
        )}

        <FeedTabs
          tab={tab}
          setTab={setTab}
          mode={mode}
          followingAvailable={false}
        />

        <FeedFilters
          posts={safePosts}
          specialty={specialty}
          setSpecialty={setSpecialty}
          postType={postType}
          setPostType={setPostType}
          count={visiblePosts.length}
          mode={mode}
        />

        {feedLoadError && (
          <div className="white-card" role="alert">
            <p>{feedLoadError}</p>
            <button
              type="button"
              className="action-btn"
              onClick={refreshFeed}
            >
              <RefreshCw size={16} /> Retry
            </button>
          </div>
        )}

        {storiesError && (
          <p className="create-post-message error" role="alert">
            Stories: {storiesError}
          </p>
        )}

        {actionError && (
          <div className="create-post-message error" role="alert">
            {actionError}
            <button
              type="button"
              onClick={() => setActionError("")}
              aria-label="Dismiss error"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {actionNotice && (
          <p className="create-post-message success" role="status">
            {actionNotice}
            <button
              type="button"
              onClick={() => setActionNotice("")}
              aria-label="Dismiss message"
            >
              <X size={14} />
            </button>
          </p>
        )}

        <div className="feed-list" id="feed-posts">
          {feedLoading && safePosts.length === 0 ? (
            <div className="white-card empty-feed">
              <LoaderCircle size={20} />
              <p>Loading community posts...</p>
            </div>
          ) : visiblePosts.length === 0 ? (
            <div className="white-card empty-feed">
              <p>
                {mode === "clinical-cases"
                  ? "No clinical cases available yet."
                  : "No posts match your filters yet."}
              </p>
            </div>
          ) : (
            visiblePosts.map((post, index) => {
              const postId = getPostId(post);

              return (
                <PostCard
                  key={postId ?? `feed-post-${index}`}
                  post={post}
                  index={index}
                  isLiked={postId != null && likedIds.has(postId)}
                  likePending={postId != null && pendingLikes.has(postId)}
                  onToggleLike={handleToggleLike}
                  onDiscuss={handleDiscuss}
                  onShare={handleShare}
                  mode={mode}
                />
              );
            })
          )}
        </div>
      </main>

      <aside className="right-bar">
        <PeopleToKnow people={safePeople} onViewAll={() => navigate("/network")} />
        <ZenveAdvantage />
        <BreakthroughCard />
      </aside>
    </div>
  );
}