import './StoryTray.css';

export default function StoryTray({
  stories = [],
  onOpenStory,
  currentUser = null,
  onCreateStory,
}) {
  return (
    <section
      className="story-tray"
      aria-label="Veterinary community stories"
    >
      <div className="story-tray__heading">
        <div>
          <h2>Stories</h2>
          <p>Updates from your veterinary community</p>
        </div>
      </div>

      <div className="story-tray__list">
        {currentUser && (
          <button
            type="button"
            className="story-tray__item story-tray__item--own"
            onClick={() => onCreateStory?.()}
          >
            <span className="story-tray__avatar-wrap">
              {currentUser.profile_picture ? (
                <img
                  className="story-tray__avatar"
                  src={currentUser.profile_picture}
                  alt=""
                />
              ) : (
                <span className="story-tray__avatar story-tray__avatar--empty">
                  {(currentUser.full_name ||
                    currentUser.username ||
                    'Y')[0].toUpperCase()}
                </span>
              )}

              <span
                className="story-tray__add"
                aria-hidden="true"
              >
                +
              </span>
            </span>

            <span className="story-tray__name">Your story</span>
          </button>
        )}

        {stories.map((story) => {
          const author =
            story.author && typeof story.author === 'object'
              ? story.author
              : story.user && typeof story.user === 'object'
                ? story.user
                : {};

          const name =
            author.full_name ||
            author.username ||
            author.name ||
            story.author_full_name ||
            story.author_username ||
            'Veterinary professional';

          const avatar =
            author.profile_picture ||
            author.avatar ||
            story.profile_picture ||
            story.author_profile_picture ||
            '';

          const hasUnseenStory =
            story.has_unseen === true ||
            story.is_unseen === true ||
            story.viewed === false;

          return (
            <button
              type="button"
              key={story.id ?? story.pk}
              className={[
                'story-tray__item',
                hasUnseenStory
                  ? 'story-tray__item--unseen'
                  : 'story-tray__item--seen',
              ].join(' ')}
              onClick={() => onOpenStory?.(story)}
              aria-label={`View ${name}'s story`}
            >
              <span className="story-tray__avatar-wrap">
                {avatar ? (
                  <img
                    className="story-tray__avatar"
                    src={avatar}
                    alt=""
                    loading="lazy"
                  />
                ) : (
                  <span className="story-tray__avatar story-tray__avatar--empty">
                    {name[0].toUpperCase()}
                  </span>
                )}
              </span>

              <span className="story-tray__name">
                {name}
              </span>
            </button>
          );
        })}

        {stories.length === 0 && (
          <p className="story-tray__empty">
            No stories available.
          </p>
        )}
      </div>
    </section>
  );
}
