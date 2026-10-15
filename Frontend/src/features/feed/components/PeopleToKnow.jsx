import './PeopleToKnow.css';
export default function PeopleToKnow({
  people = [],
  onViewProfile,
  onConnect,
  onSeeAll,
}) {
  return (
    <aside
      className="people-to-know"
      aria-label="People to know"
    >
      <header className="people-to-know__header">
        <div>
          <h2>People to Know</h2>
          <p>Grow your veterinary network</p>
        </div>

        {people.length > 0 && (
          <button
            type="button"
            className="people-to-know__see-all"
            onClick={onSeeAll}
          >
            See all
          </button>
        )}
      </header>

      {people.length > 0 ? (
        <div className="people-to-know__list">
          {people.map((person) => {
            const name =
              person.full_name ||
              person.name ||
              person.username ||
              'Veterinary professional';

            const avatar =
              person.profile_picture ||
              person.avatar ||
              person.profile_image ||
              '';

            const specialty =
              person.specialty ||
              person.specialization ||
              person.profession ||
              'Veterinary professional';

            const id = person.id ?? person.pk;

            return (
              <article
                className="people-to-know__person"
                key={id ?? person.username ?? name}
              >
                <button
                  type="button"
                  className="people-to-know__profile"
                  onClick={() => onViewProfile?.(person)}
                  disabled={id == null}
                  aria-label={`View ${name}'s profile`}
                >
                  {avatar ? (
                    <img
                      className="people-to-know__avatar"
                      src={avatar}
                      alt=""
                      loading="lazy"
                    />
                  ) : (
                    <span className="people-to-know__avatar people-to-know__avatar--empty">
                      {name[0].toUpperCase()}
                    </span>
                  )}
                </button>

                <div className="people-to-know__details">
                  <button
                    type="button"
                    className="people-to-know__name"
                    onClick={() => onViewProfile?.(person)}
                    disabled={id == null}
                  >
                    {name}
                  </button>

                  <p className="people-to-know__specialty">
                    {specialty}
                  </p>

                  {person.city && (
                    <p className="people-to-know__location">
                      {person.city}
                    </p>
                  )}

                  <button
                    type="button"
                    className="people-to-know__connect"
                    onClick={() => onConnect?.(person)}
                  >
                    Connect
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="people-to-know__empty">
          <p>No suggestions available.</p>
        </div>
      )}

      <footer className="people-to-know__footer">
        <p>Connect with veterinary professionals and grow your community.</p>
      </footer>
    </aside>
  );
}
