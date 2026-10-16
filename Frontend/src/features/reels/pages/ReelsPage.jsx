
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowUpRight,
  Award,
  Bookmark,
  Check,
  ChevronRight,
  Globe,
  Heart,
  MapPin,
  MessageCircle,
  Plus,
  RefreshCw,
  Share2,
  Sparkles,
  Stethoscope,
  Upload,
  Users,
  Video,
  Volume2,
  VolumeX,
} from "lucide-react";

import {
  fetchShortVideos,
  createShortVideo,
  likeFeedPost,
  unlikeFeedPost,
} from "../services/reelsService.js";

import "./ReelsPage.css";

const SPECIALTIES = [
  "Animal Nutrition",
  "Cardiology",
  "Diagnostic Imaging",
  "Emergency & Critical Care",
  "Equine Medicine",
  "Livestock Health",
  "Preventive Medicine",
  "Small Animal Medicine",
  "Surgery",
  "Veterinary Dentistry",
  "Veterinary Dermatology",
  "Veterinary Surgery",
  "Wildlife Medicine",
];

const STATES = [
  "Andhra Pradesh",
  "Karnataka",
  "Kerala",
  "Maharashtra",
  "New Delhi",
  "Tamil Nadu",
  "Telangana",
  "Uttar Pradesh",
  "West Bengal",
];

function getId(post) {
  return post?.id ?? post?.pk;
}

function getType(post) {
  return String(post?.content_type || post?.post_type || post?.type || "")
    .toLowerCase()
    .replace(/-/g, "_");
}

function getVideoUrl(post) {
  return post?.media_url || post?.video_url || post?.media?.url || "";
}

function getThumbnail(post) {
  return post?.thumbnail_url || post?.thumbnail || post?.cover_image || "";
}

function getAuthor(post) {
  return (
    post?.author_full_name ||
    post?.author?.full_name ||
    post?.author?.username ||
    post?.author_name ||
    "Veterinarian"
  );
}

function getAvatar(post) {
  return (
    post?.author_avatar ||
    post?.author?.avatar ||
    post?.author?.profile_picture ||
    "/default-avatar.png"
  );
}

function getCount(value) {
  if (Array.isArray(value)) return value.length;
  return Number(value) || 0;
}

function getError(error) {
  return error?.message || "Something went wrong. Please try again.";
}

function HeroBanner() {
  return (
    <section className="reels-hero">
      <div className="reels-hero-content">
        <p className="reels-eyebrow">THE ZENVE VET COMMUNITY</p>
        <h1>Small moments. Big discoveries.</h1>
        <p>
          Explore veterinary knowledge and experiences through video.
        </p>
        <a href="#video-feed">
          Make your mark <ArrowUpRight size={16} />
        </a>
      </div>

      <div className="reels-hero-brand">
        <Stethoscope size={58} strokeWidth={1.3} />
        <span>BETTER<br />TOGETHER</span>
      </div>
    </section>
  );
}

function VideoMoments({ videos, onUpload, onSelect }) {
  const creators = useMemo(() => {
    const seen = new Set();

    return videos.filter((video) => {
      const id = video.author?.id ?? video.author_id ?? getAuthor(video);

      if (seen.has(id)) return false;
      seen.add(id);
      return true;
    }).slice(0, 8);
  }, [videos]);

  return (
    <section className="reels-moments">
      <div className="reels-section-heading">
        <h2>Video moments from the community</h2>
        <span>VIDEOS <ArrowUpRight size={13} /></span>
      </div>

      <div className="reels-moments-list">
        <button
          className="reels-moment"
          type="button"
          onClick={onUpload}
        >
          <span className="reels-moment-ring reels-add-ring">
            <Plus size={22} />
          </span>
          <span>Your video</span>
        </button>

        {creators.map((video, index) => (
          <button
            className="reels-moment"
            type="button"
            key={getId(video) ?? index}
            onClick={() => onSelect(video)}
            title={`Watch video by ${getAuthor(video)}`}
          >
            <span className="reels-moment-ring">
              <img src={getAvatar(video)} alt="" />
              <Video className="reels-moment-video-icon" size={15} />
            </span>
            <span>{getAuthor(video).split(" ")[0]}</span>
          </button>
        ))}

        {videos.length === 0 && (
          <p className="reels-muted">Published videos will appear here.</p>
        )}
      </div>
    </section>
  );
}

function VideoCard({ post, liked, pending, saved, onLike, onShare, onComment, onSave }) {
  const [muted, setMuted] = useState(true);
  const [playing, setPlaying] = useState(false);
  const videoRef = useRef(null);

  const videoUrl = getVideoUrl(post);
  const thumbnail = getThumbnail(post);
  const id = getId(post);

  return (
    <article className="reels-video-card" id={`video-${id}`}>
      <div className="reels-video-player">
        {videoUrl ? (
          <video
            ref={videoRef}
            src={videoUrl}
            poster={thumbnail || undefined}
            controls
            playsInline
            preload="metadata"
            muted={muted}
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
          />
        ) : (
          <div className="reels-video-unavailable">
            {thumbnail && <img src={thumbnail} alt="" />}
            <Video size={32} />
            <p>Video URL is not available.</p>
          </div>
        )}

        {videoUrl && (
          <button
            type="button"
            className="reels-mute-button"
            onClick={() => {
              setMuted((value) => !value);
              if (videoRef.current) {
                videoRef.current.muted = !muted;
              }
            }}
            aria-label={muted ? "Unmute video" : "Mute video"}
          >
            {muted ? <VolumeX size={19} /> : <Volume2 size={19} />}
          </button>
        )}

        <div className="reels-video-overlay">
          <div className="reels-video-author">
            <img src={getAvatar(post)} alt="" />
            <div>
              <strong>{getAuthor(post)}</strong>
              <small>
                {post.author?.specialty || post.author_specialty || post.specialty || "Veterinary professional"}
              </small>
            </div>
          </div>

          {post.caption && (
            <p className="reels-video-caption">{post.caption}</p>
          )}
        </div>
      </div>

      <div className="reels-video-actions">
        <button
          type="button"
          className={liked ? "reels-action is-liked" : "reels-action"}
          onClick={() => onLike(post)}
          disabled={pending}
          aria-pressed={liked}
        >
          <Heart size={20} fill={liked ? "currentColor" : "none"} />
          <span>{getCount(post.likes_count ?? post.likes)}</span>
        </button>

        <button
          type="button"
          className="reels-action"
          onClick={() => onComment(post)}
        >
          <MessageCircle size={20} />
          <span>{getCount(post.comments_count ?? post.comments)}</span>
        </button>

        <button
          type="button"
          className="reels-action"
          onClick={() => onShare(post)}
        >
          <Share2 size={20} />
          <span>Share</span>
        </button>

        <button
          type="button"
          className={saved ? "reels-action is-saved" : "reels-action"}
          onClick={() => onSave(post)}
          aria-pressed={saved}
        >
          {saved ? <Check size={20} /> : <Bookmark size={20} />}
          <span>{saved ? "Saved" : "Save"}</span>
        </button>
      </div>
    </article>
  );
}

function PeopleToKnow() {
  const people = [
    {
      name: "Dr. Arjun Mehta",
      specialty: "Veterinary Surgery",
      city: "Mumbai",
      avatar: "/assets/men-0-CJkWiJuy.jpg",
    },
    {
      name: "Dr. Priya Nair",
      specialty: "Veterinary Dermatology",
      city: "Kochi",
      avatar: "/assets/women-1-xoP18Jy1.jpg",
    },
    {
      name: "Dr. Vikram Singh",
      specialty: "Equine Medicine",
      city: "Jaipur",
      avatar: "/assets/men-1-BWZc6gqQ.jpg",
    },
  ];

  return (
    <section className="reels-sidebar-card">
      <h3>PEOPLE TO KNOW</h3>
      {people.map((person) => (
        <div className="reels-person" key={person.name}>
          <img src={person.avatar} alt="" />
          <div>
            <strong>{person.name}</strong>
            <span>{person.specialty}</span>
            <small><MapPin size={12} /> {person.city}</small>
          </div>
        </div>
      ))}
    </section>
  );
}

function ZenveAdvantage() {
  return (
    <section className="reels-sidebar-card reels-advantage">
      <h3>THE ZENVE ADVANTAGE</h3>

      <div className="reels-advantage-item">
        <Globe size={20} />
        <div>
          <strong>Your own professional page</strong>
          <p>A place for your work, your voice, your professional identity.</p>
        </div>
      </div>

      <div className="reels-advantage-item">
        <Users size={20} />
        <div>
          <strong>Meaningful connections</strong>
          <p>Discover peers beyond your clinic and your city.</p>
        </div>
      </div>

      <div className="reels-advantage-item">
        <Award size={20} />
        <div>
          <strong>Grow with possibility</strong>
          <p>Mentorship, research and innovation pathways.</p>
        </div>
      </div>
    </section>
  );
}

export default function ReelsPage() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [tab, setTab] = useState("For you");
  const [specialty, setSpecialty] = useState("all");
  const [stateFilter, setStateFilter] = useState("all");
  const [likedIds, setLikedIds] = useState(() => new Set());
  const [pendingIds, setPendingIds] = useState(() => new Set());
  const [savedIds, setSavedIds] = useState(() => new Set());
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadCaption, setUploadCaption] = useState("");
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");

  const loadVideos = useCallback(async (signal) => {
    setLoading(true);
    setError("");

    try {
      const result = await fetchShortVideos({ signal });

      if (!signal?.aborted) {
        setVideos((Array.isArray(result) ? result : []).filter(
          (post) => getType(post) === "video" || getType(post) === "short_video"
        ));
      }
    } catch (err) {
      if (!signal?.aborted) setError(getError(err));
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    loadVideos(controller.signal);
    return () => controller.abort();
  }, [loadVideos]);

  const visibleVideos = useMemo(() => {
    let result = [...videos];

    if (specialty !== "all") {
      result = result.filter((video) =>
        (video.author?.specialty || video.author_specialty || video.specialty) === specialty
      );
    }

    if (stateFilter !== "all") {
      result = result.filter((video) =>
        (video.author?.state || video.author_state || video.state) === stateFilter
      );
    }

    if (tab === "Popular") {
      result.sort(
        (a, b) =>
          getCount(b.likes_count ?? b.likes) -
          getCount(a.likes_count ?? a.likes)
      );
    } else if (tab === "Following") {
      result = result.filter((video) =>
        video.is_following === true || video.author?.is_following === true
      );
    }

    return result;
  }, [videos, specialty, stateFilter, tab]);

  async function handleLike(post) {
    const id = getId(post);
    if (id == null || pendingIds.has(id)) return;

    if (!localStorage.getItem("zenveAccessToken")) {
      setError("Please sign in to like a video.");
      return;
    }

    const wasLiked = likedIds.has(id);

    setPendingIds((current) => new Set(current).add(id));
    setLikedIds((current) => {
      const next = new Set(current);
      wasLiked ? next.delete(id) : next.add(id);
      return next;
    });

    try {
      if (wasLiked) await unlikeFeedPost(id);
      else await likeFeedPost(id);
    } catch (err) {
      setLikedIds((current) => {
        const next = new Set(current);
        wasLiked ? next.add(id) : next.delete(id);
        return next;
      });
      setError(getError(err));
    } finally {
      setPendingIds((current) => {
        const next = new Set(current);
        next.delete(id);
        return next;
      });
    }
  }

  async function handleShare(post) {
    const id = getId(post);
    const url = `${window.location.origin}/reels${id ? `?video=${id}` : ""}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: "Zenve Vet Short Video",
          text: post.caption || "Watch this veterinary video.",
          url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        setNotice("Video link copied.");
      }
    } catch (err) {
      if (err?.name !== "AbortError") {
        setError("Unable to share this video.");
      }
    }
  }

  function handleSave(post) {
    const id = getId(post);
    if (id == null) return;

    setSavedIds((current) => {
      const next = new Set(current);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function handleComment(post) {
    const id = getId(post);
    if (id != null) {
      window.location.href = `/posts/${id}#comments`;
    }
  }

  function handleFileChange(event) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    if (!file.type.startsWith("video/")) {
      setError("Please select a valid video file.");
      return;
    }

    if (file.size > 100 * 1024 * 1024) {
      setError("Videos must be smaller than 100 MB.");
      return;
    }

    if (previewUrl) URL.revokeObjectURL(previewUrl);

    setUploadFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setUploadOpen(true);
    setError("");
    setNotice("");
  }

  async function handlePublishVideo(event) {
    event.preventDefault();

    if (!uploadFile) return;

    setError("");

    try {
      setUploading(true);

      // This requires a backend upload endpoint that accepts the file.
      // createShortVideo currently accepts a URL, not a local File.
      // Do not pretend a local file was uploaded if the API cannot upload it.
      const videoUrl = uploadFile.url || "";

      if (!videoUrl) {
        throw new Error(
          "Your backend needs a video-upload endpoint before local videos can be published. The selected video is preview-only."
        );
      }

      await createShortVideo({
        caption: uploadCaption,
        media_url: videoUrl,
      });

      setUploadOpen(false);
      setUploadFile(null);
      setUploadCaption("");
      setNotice("Video published.");
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl("");
      await loadVideos();
    } catch (err) {
      setError(getError(err));
    } finally {
      setUploading(false);
    }
  }

  function closeUpload() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl("");
    setUploadFile(null);
    setUploadCaption("");
    setUploadOpen(false);
  }

  return (
    <div className="reels-layout">
      <main className="reels-main">
        <HeroBanner />

        <VideoMoments
          videos={videos}
          onUpload={() => document.getElementById("reels-video-input")?.click()}
          onSelect={(post) => {
            const id = getId(post);
            document.getElementById(`video-${id}`)?.scrollIntoView({
              behavior: "smooth",
              block: "center",
            });
          }}
        />

        <input
          id="reels-video-input"
          type="file"
          accept="video/*"
          hidden
          onChange={handleFileChange}
        />

        <section className="reels-upload-card">
          <div className="reels-upload-avatar">V</div>
          <div className="reels-upload-content">
            <strong>Share a moment from your practice</strong>
            <p>Upload a short veterinary video for the community.</p>
          </div>
          <button
            type="button"
            className="reels-upload-button"
            onClick={() => document.getElementById("reels-video-input")?.click()}
          >
            <Upload size={16} /> Short video
          </button>
        </section>

        {uploadOpen && (
          <section className="reels-upload-card reels-upload-form">
            <div className="reels-section-heading">
              <h2>Preview your video</h2>
              <button type="button" onClick={closeUpload}>Cancel</button>
            </div>

            {previewUrl && (
              <video src={previewUrl} controls playsInline />
            )}

            <form onSubmit={handlePublishVideo}>
              <label htmlFor="reels-caption">Caption</label>
              <textarea
                id="reels-caption"
                value={uploadCaption}
                onChange={(event) => setUploadCaption(event.target.value)}
                placeholder="Share what others can learn from this video..."
                rows={3}
                maxLength={2000}
              />

              <button
                className="reels-upload-button"
                type="submit"
                disabled={uploading}
              >
                {uploading ? "Publishing..." : "Publish video"}
              </button>
            </form>
          </section>
        )}

        <div className="reels-tabs">
          {["For you", "Popular", "Following"].map((item) => (
            <button
              key={item}
              type="button"
              className={tab === item ? "active" : ""}
              onClick={() => setTab(item)}
            >
              {item}
            </button>
          ))}

          <span>{visibleVideos.length} VIDEOS</span>
        </div>

        <section className="reels-filters">
          <select
            value={specialty}
            onChange={(event) => setSpecialty(event.target.value)}
            aria-label="Filter by specialty"
          >
            <option value="all">All specialties</option>
            {SPECIALTIES.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>

          <select
            value={stateFilter}
            onChange={(event) => setStateFilter(event.target.value)}
            aria-label="Filter by state"
          >
            <option value="all">All states</option>
            {STATES.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>

          <button type="button" onClick={() => {
            setSpecialty("all");
            setStateFilter("all");
            setTab("For you");
          }}>
            Reset filters
          </button>

          <button
            type="button"
            className="reels-refresh"
            onClick={() => loadVideos()}
            disabled={loading}
          >
            <RefreshCw size={15} /> Refresh
          </button>
        </section>

        {error && (
          <div className="reels-message error" role="alert">
            {error}
            <button type="button" onClick={() => setError("")}>Dismiss</button>
          </div>
        )}

        {notice && (
          <div className="reels-message success" role="status">
            {notice}
            <button type="button" onClick={() => setNotice("")}>Dismiss</button>
          </div>
        )}

        {loading ? (
          <div className="reels-empty">
            <RefreshCw className="reels-loading-icon" size={24} />
            <p>Loading videos...</p>
          </div>
        ) : visibleVideos.length === 0 ? (
          <div className="reels-empty">
            <Video size={34} />
            <h2>No short videos yet</h2>
            <p>Published video posts matching your filters will appear here.</p>
          </div>
        ) : (
          <section className="reels-video-feed" id="video-feed">
            {visibleVideos.map((post, index) => {
              const id = getId(post);

              return (
                <VideoCard
                  key={id ?? index}
                  post={post}
                  liked={id != null && likedIds.has(id)}
                  pending={id != null && pendingIds.has(id)}
                  saved={id != null && savedIds.has(id)}
                  onLike={handleLike}
                  onShare={handleShare}
                  onComment={handleComment}
                  onSave={handleSave}
                />
              );
            })}
          </section>
        )}
      </main>

      <aside className="reels-sidebar">
        <PeopleToKnow />
        <ZenveAdvantage />
      </aside>
    </div>
  );
}
