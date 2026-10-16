import './StoryViewer.css';
export default function StoryViewer({
  stories = [],
  activeIndex = 0,
  onClose,
  onNext,
  onPrevious,
  onPause,
  onResume,
}) {
  if (!stories.length) {
    return null;
  }

  const story = stories[activeIndex];

  if (!story) {
    return null;
  }

  const author = story.author || story.user || {};

  const authorName =
    author.full_name ||
    author.username ||
    author.name ||
    'Veterinary professional';

  const avatar =
    author.profile_picture ||
    author.avatar ||
    '';

  const mediaUrl =
    story.media_url ||
    story.image_url ||
    story.video_url ||
    story.image ||
    story.video ||
    '';

  const isVideo = Boolean(
    story.video_url ||
    story.video ||
    story.media_type === 'video'
  );

  const timestamp =
    story.created_at ||
    story.createdAt ||
    '';

  return (
    <div
      className="story-viewer"
      role="dialog"
      aria-modal="true"
      aria-label={`${authorName}'s story`}
    >
      <div className="story-viewer__backdrop" onClick={onClose} />

      <section
        className="story-viewer__content"
        onMouseEnter={onPause}
        onMouseLeave={onResume}
        onTouchStart={onPause}
        onTouchEnd={onResume}
      >
        <div className="story-viewer__progress-list">
          {stories.map((item, index) => (
            <div
              className="story-viewer__progress-track"
              key={item.id ?? item.pk ?? index}
            >
              <span
                className={[
                  'story-viewer__progress-fill',
                  index < activeIndex
                    ? 'story-viewer__progress-fill--complete'
                    : '',
                  index === activeIndex
                    ? 'story-viewer__progress-fill--active'
                    : '',
                ].join(' ')}
              />
            </div>
          ))}
        </div>

        <header className="story-viewer__header">
          <div className="story-viewer__author">
            {avatar ? (
              <img
                className="story-viewer__avatar"
                src={avatar}
                alt=""
              />
            ) : (
              <span className="story-viewer__avatar story-viewer__avatar--empty">
                {authorName[0].toUpperCase()}
              </span>
            )}

            <div className="story-viewer__author-info">
              <strong>{authorName}</strong>
              {timestamp && (
                <time dateTime={timestamp}>
                  {timestamp}
                </time>
              )}
            </div>
          </div>

          <button
            type="button"
            className="story-viewer__close"
            onClick={onClose}
            aria-label="Close story"
          >
            ×
          </button>
        </header>

        <div className="story-viewer__media">
          {mediaUrl && isVideo ? (
            <video
              src={mediaUrl}
              className="story-viewer__asset"
              autoPlay
              playsInline
            />
          ) : mediaUrl ? (
            <img
              src={mediaUrl}
              className="story-viewer__asset"
              alt={story.caption || 'Story'}
            />
          ) : (
            <div className="story-viewer__unavailable">
              Story media is unavailable.
            </div>
          )}

          <button
            type="button"
            className="story-viewer__navigation story-viewer__navigation--previous"
            onClick={onPrevious}
            aria-label="Previous story"
          />

          <button
            type="button"
            className="story-viewer__navigation story-viewer__navigation--next"
            onClick={onNext}
            aria-label="Next story"
          />
        </div>

        {story.caption && (
          <p className="story-viewer__caption">
            {story.caption}
          </p>
        )}
      </section>
    </div>
  );
}
