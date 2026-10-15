
import './DoctorCard.css';

export default function DoctorCard({ doctor, onViewProfile, onConnect }) {
  if (!doctor) return null;

  const id = doctor.id ?? doctor.pk;
  const name =
    doctor.full_name ||
    doctor.name ||
    doctor.username ||
    'Veterinary Professional';

  const specialty =
    doctor.specialty ||
    doctor.specialization ||
    'Veterinary Professional';

  const location =
    doctor.city ||
    doctor.location ||
    'Location not provided';

  const avatar =
    doctor.avatar ||
    doctor.profile_picture ||
    doctor.profile_image ||
    doctor.image ||
    '';

  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');

  return (
    <article className="network-doctor-card">
      <div className="network-doctor-card__top">
        {avatar ? (
          <img
            className="network-doctor-card__avatar"
            src={avatar}
            alt={`${name}'s profile`}
            loading="lazy"
            onError={(event) => {
              event.currentTarget.style.display = 'none';
            }}
          />
        ) : (
          <div
            className="network-doctor-card__avatar network-doctor-card__initials"
            aria-label={name}
          >
            {initials || 'V'}
          </div>
        )}

        <div className="network-doctor-card__identity">
          <h3 className="network-doctor-card__name">{name}</h3>
          <p className="network-doctor-card__specialty">{specialty}</p>
          <p className="network-doctor-card__location">{location}</p>
        </div>
      </div>

      {doctor.about && (
        <p className="network-doctor-card__about">{doctor.about}</p>
      )}

      <div className="network-doctor-card__actions">
        <button
          type="button"
          className="network-doctor-card__button network-doctor-card__button--primary"
          onClick={() => onViewProfile?.(id)}
          disabled={id == null}
        >
          View profile
        </button>

        <button
          type="button"
          className="network-doctor-card__button network-doctor-card__button--secondary"
          onClick={() => onConnect?.(doctor)}
        >
          Connect
        </button>
      </div>
    </article>
  );
}
