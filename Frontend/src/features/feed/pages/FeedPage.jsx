
import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  Flag,
  Globe,
  ChevronRight,
  Users,
  Award,
  LoaderCircle,
  RefreshCw,
  X,
} from "lucide-react";

import "./FeedPage.css";
// import CreatePostCard from "../components/CreatePostCard.jsx";

import CreatePostCard from "../components/CreatorPostCard.jsx";
import useFeed from "../hooks/useFeed.js";
import useStories from "../hooks/useStories.js";

import {
  createFeedPost,
  likeFeedPost,
  unlikeFeedPost,
} from "../service/feedService.js";

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

function getAuthorAvatar(post) {
  return (
    post?.author_avatar ||
    post?.author?.avatar ||
    post?.author?.profile_picture ||
    post?.avatar ||
    "/default-avatar.png"
  );
}

function getPostType(post) {
  return String(
    post?.content_type || post?.post_type || post?.type || "post"
  )
    .toLowerCase()
    .replace(/-/g, "_");
}

function getMediaUrl(post) {
  return (
    post?.media_url ||
    post?.image_url ||
    post?.image ||
    post?.cover_image ||
    ""
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

function StoriesSection({
  stories,
  loading,
  onCreateStory,
  onOpenStory,
}) {
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
          onClick={onCreateStory}
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
            onClick={() => onOpenStory(index)}
            aria-label={`View story by ${
              story.author_full_name ||
              story.author_username ||
              "Veterinarian"
            }`}
          >
            <div className="ring">
              <img
                src={
                  story.author_avatar ||
                  story.author?.avatar ||
                  story.avatar ||
                  "/default-avatar.png"
                }
                alt=""
              />
            </div>

            <span>
              {story.author_full_name ||
                story.author_username ||
                story.name ||
                "Veterinarian"}
            </span>
          </button>
        ))}

        {!loading && stories.length === 0 && (
          <span className="empty-text">No stories yet</span>
        )}

        {loading && (
          <span className="empty-text">Loading stories...</span>
        )}
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
        {mode === "clinical-cases"
          ? "CLINICAL CASES"
          : "COMMUNITY FEED"}
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
    () =>
      [...new Set(posts.map(getPostType).filter(Boolean))].sort(),
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
  const isClinical =
    mode === "clinical-cases" ||
    getPostType(post) === "case" ||
    getPostType(post) === "clinical_case";

  const title = post.title || post.case_title;
  const description = getPostContent(post);
  const author = getAuthorName(post);
  const role =
    post.author_specialty ||
    post.specialty ||
    post.author?.specialty ||
    post.role ||
    "Veterinary professional";

  const image = getMediaUrl(post);
  const likesCount = getCount(post.likes_count ?? post.likes);
  const commentsCount = getCount(
    post.comments_count ?? post.comments
  );

  const postId = getPostId(post) ?? `post-${index}`;

  return (
    <article className="white-card post-card">
      <div className="post-head">
        <img src={getAuthorAvatar(post)} alt="" />

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
          {post.species && (
            <p>
              <b>Animal / Species:</b> {post.species}
            </p>
          )}
          {post.symptoms && (
            <p>
              <b>Clinical signs:</b> {post.symptoms}
            </p>
          )}
          {post.diagnosis && (
            <p>
              <b>Diagnosis:</b> {post.diagnosis}
            </p>
          )}
          {post.treatment && (
            <p>
              <b>Treatment:</b> {post.treatment}
            </p>
          )}
          {post.outcome && (
            <p>
              <b>Outcome:</b> {post.outcome}
            </p>
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

      {getPostType(post) === "video" && image && (
        <video className="post-image" src={image} controls>
          Your browser does not support video playback.
        </video>
      )}

      {isClinical && (
        <div className="consent">
          <ClipboardList size={15} />
          <span>
            Clinical case · Verify patient consent and de-identification
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
          {likesCount} likes
        </span>

        <span>
          <MessageCircle size={15} />
          {commentsCount} comments
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
          onClick={() => onToggleLike(post)}
          disabled={likePending}
          aria-pressed={isLiked}
          aria-label={isLiked ? "Unlike post" : "Like post"}
        >
          {likePending ? (
            <LoaderCircle size={19} />
          ) : (
            <Heart
              size={20}
              strokeWidth={1.8}
              fill={isLiked ? "currentColor" : "none"}
            />
          )}
          <span>{isLiked ? "Appreciated" : "Appreciate"}</span>
        </button>

        <button
          type="button"
          className="action-btn"
          onClick={() => onDiscuss(post)}
        >
          <MessageCircle size={18} />
          <span>Discuss</span>
        </button>

        <button
          type="button"
          className="action-btn"
          onClick={() => onShare(post)}
        >
          <Share2 size={18} />
          <span>Share</span>
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
        <span className="text-link">View all</span>
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
              <b>
                {person.name ||
                  person.full_name ||
                  person.username ||
                  "Veterinarian"}
              </b>
              <small>{person.spec || person.specialty || ""}</small>
              <small className="person-location">
                <MapPin size={12} />
                {person.city || "Location unavailable"}
              </small>
            </div>
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
  posts: providedPosts,
  peopleToKnow = [],
  stories: providedStories,
  mode = "feed",
}) {
  const navigate = useNavigate();

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
  const [storySubmitting, setStorySubmitting] = useState(false);
  const [videoPreview, setVideoPreview] = useState(null);

  const safePosts = Array.isArray(providedPosts)
    ? providedPosts.length
      ? providedPosts
      : fetchedPosts
    : fetchedPosts;

  const safeStories = Array.isArray(providedStories)
    ? providedStories.length
      ? providedStories
      : fetchedStories
    : fetchedStories;

  const safePeople = Array.isArray(peopleToKnow)
    ? peopleToKnow
    : [];

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
          (post.specialty ||
            post.author_specialty ||
            post.author?.specialty) === specialty
      );
    }

    if (postType !== "all-posts") {
      result = result.filter(
        (post) => getPostType(post) === postType
      );
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

      const { createStory } = await import(
        "../service/storyService.js"
      );

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

        if (wasLiked) {
          next.delete(postId);
        } else {
          next.add(postId);
        }

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

  async function handleStoryFileChange(event) {
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
    if (videoPreview?.url) {
      URL.revokeObjectURL(videoPreview.url);
    }
    setVideoPreview(null);
  }

  return (
    <div className="layout-center-right">
      <main className="center-feed">
        <HeroBanner mode={mode} />

        <StoriesSection
          stories={safeStories}
          loading={storiesLoading}
          onCreateStory={() =>
            document.getElementById("zenve-story-upload")?.click()
          }
          onOpenStory={setSelectedStoryIndex}
        />

        <input
          id="zenve-story-upload"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          hidden
          onChange={handleStoryFileChange}
        />

        <CreatePostCard
          mode={mode}
          onCreatePost={handleCreatePost}
          onCreateStory={handleCreateStory}
          onOpenClinicalCase={() => navigate("/clinical-cases")}
          onOpenVideo={() => {
            document.getElementById("zenve-video-upload")?.click();
          }}
        />

        <input
          id="zenve-video-upload"
          type="file"
          accept="video/*"
          hidden
          onChange={handleVideoChange}
        />

        {storyUploadOpen && (
          <div className="white-card" role="dialog" aria-modal="true">
            <div className="head">
              <b>Create story</b>
              <button
                type="button"
                className="action-btn"
                onClick={() => {
                  setStoryUploadOpen(false);
                  setStoryFile(null);
                }}
                aria-label="Close story form"
              >
                <X size={18} />
              </button>
            </div>

            {storyFile && (
              <img
                className="post-image"
                src={URL.createObjectURL(storyFile)}
                alt="Story preview"
              />
            )}

            <form onSubmit={submitStory}>
              <label htmlFor="zenve-story-caption">Caption (optional)</label>
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
          </div>
        )}

        {selectedStoryIndex !== null && (
          <div
            className="white-card"
            role="dialog"
            aria-modal="true"
            aria-label="Story viewer"
          >
            <div className="head">
              <b>
                {safeStories[selectedStoryIndex]?.author_full_name ||
                  safeStories[selectedStoryIndex]?.author_username ||
                  "Community story"}
              </b>

              <button
                type="button"
                className="action-btn"
                onClick={() => setSelectedStoryIndex(null)}
                aria-label="Close story"
              >
                <X size={18} />
              </button>
            </div>

            {safeStories[selectedStoryIndex]?.media_url && (
              <img
                className="post-image"
                src={safeStories[selectedStoryIndex].media_url}
                alt={safeStories[selectedStoryIndex].caption || "Story"}
              />
            )}

            <p>{safeStories[selectedStoryIndex]?.caption}</p>

            <div className="actions">
              <button
                type="button"
                className="action-btn"
                disabled={selectedStoryIndex === 0}
                onClick={() =>
                  setSelectedStoryIndex((index) => index - 1)
                }
              >
                Previous
              </button>

              <button
                type="button"
                className="action-btn"
                disabled={selectedStoryIndex >= safeStories.length - 1}
                onClick={() =>
                  setSelectedStoryIndex((index) => index + 1)
                }
              >
                Next
              </button>
            </div>
          </div>
        )}

        {videoPreview && (
          <div className="white-card" role="dialog" aria-modal="true">
            <div className="head">
              <b>Video preview</b>
              <button
                type="button"
                className="action-btn"
                onClick={closeVideoPreview}
                aria-label="Close video preview"
              >
                <X size={18} />
              </button>
            </div>

            <video
              className="post-image"
              src={videoPreview.url}
              controls
              autoPlay
            />

            <p>
              {videoPreview.file.name} — preview only; publishing is not
              connected until the backend supports video uploads.
            </p>
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
                  likePending={
                    postId != null && pendingLikes.has(postId)
                  }
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
        <PeopleToKnow people={safePeople} />
        <ZenveAdvantage />
        <BreakthroughCard />
      </aside>
    </div>
  );
}
