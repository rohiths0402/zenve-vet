import './ContentCard.css';

export default function ContentCard({
  content,
  type = 'post',
  onLike,
  onComment,
  onShare,
  onSave,
  onOpen,
}) {
  if (!content) return null;

  const author =
    content.author ||
    content.user ||
    {};

  // The API may return author details as flat fields rather than a nested object.
  const authorName =
    author.full_name ||
    author.name ||
    author.username ||
    content.author_full_name ||
    content.author_name ||
    content.author_username ||
    'Unknown professional';

  const authorAvatar =
    author.profile_picture ||
    author.avatar ||
    content.author_profile_picture ||
    content.profile_picture ||
    '';

  const mediaUrl =
    content.media_url ||
    content.image_url ||
    content.video_url ||
    content.image ||
    content.video ||
    '';

  const description =
    content.caption ||
    content.description ||
    content.text ||
    content.content ||
    content.case_summary ||
    '';

  const createdAt =
    content.created_at ||
    content.createdAt ||
    '';

  const isVideo =
    type === 'video' ||
    content.content_type === 'video' ||
    Boolean(content.video_url || content.video);

  return (
    <article className="content-card">
      <header className="content-card__header">
        <button
          type="button"
          className="content-card__author"
          onClick={() => onOpen?.(content)}
        >
          {authorAvatar ? (
            <img
              className="content-card__avatar"
              src={authorAvatar}
              alt=""
              loading="lazy"
            />
          ) : (
            <span className="content-card__avatar content-card__avatar--empty">
              {authorName.charAt(0).toUpperCase()}
            </span>
          )}

          <span className="content-card__author-info">
            <strong>{authorName}</strong>
            {createdAt && (
              <time dateTime={createdAt}>
                {createdAt}
              </time>
            )}
          </span>
        </button>
      </header>

      {description && (
        <p className="content-card__description">
          {description}
        </p>
      )}

      {mediaUrl && (
        <div className="content-card__media">
          {isVideo ? (
            <video
              src={mediaUrl}
              controls
              preload="metadata"
              playsInline
            >
              Your browser does not support video playback.
            </video>
          ) : (
            <img
              src={mediaUrl}
              alt={content.media_alt || 'Content shared by a veterinary professional'}
              loading="lazy"
            />
          )}
        </div>
      )}

      {content.title && (
        <h3 className="content-card__title">
          {content.title}
        </h3>
      )}

      <footer className="content-card__actions">
        <button
          type="button"
          onClick={() => onLike?.(content)}
          aria-label="Like"
        >
          Like
        </button>

        <button
          type="button"
          onClick={() => onComment?.(content)}
          aria-label="Comment"
        >
          Comment
        </button>

        <button
          type="button"
          onClick={() => onShare?.(content)}
          aria-label="Share"
        >
          Share
        </button>

        <button
          type="button"
          onClick={() => onSave?.(content)}
          aria-label="Save"
        >
          Save
        </button>
      </footer>
    </article>
  );
}
