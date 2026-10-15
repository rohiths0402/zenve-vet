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

  const authorName =
    author.full_name ||
    author.name ||
    author.username ||
    'Unknown professional';

  const authorAvatar =
    author.profile_picture ||
    author.avatar ||
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
    '';

  const createdAt =
    content.created_at ||
    content.createdAt ||
    '';

  const isVideo =
    type === 'video' ||
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
