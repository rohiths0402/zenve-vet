
import './DoctorCard.css';

export default function DoctorCard({
  doctor,
  onViewProfile,
  onConnect,
}) {
  const name =
    doctor.fullName ||
    doctor.full_name ||
    doctor.name ||
    doctor.username ||
    'Veterinary Doctor';

  const specialty =
    doctor.specialty ||
    doctor.specialization ||
    'Veterinary Professional';

  const city = doctor.city || '';
  const state = doctor.state || '';
  const location = [city, state].filter(Boolean).join(', ');

  const image =
    doctor.profile_photo_url ||
    doctor.avatar ||
    doctor.profile_picture ||
    doctor.profile_image ||
    doctor.image ||
    '';

  const verified =
    doctor.is_verified === true || doctor.verified === true;

  return (
    <article className="doctor-card">
      <div className="doctor-card__banner">
        <svg
          className="doctor-card__stethoscope"
          viewBox="0 0 64 64"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M15 7v13a14 14 0 0 0 28 0V7"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <path
            d="M10 7v7M20 7v7M38 7v7M48 7v7"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <path
            d="M29 34v6a12 12 0 0 0 24 0V27"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <circle
            cx="53"
            cy="23"
            r="5"
            stroke="currentColor"
            strokeWidth="2.5"
          />
        </svg>

        <span className="doctor-card__banner-city">
          {city || 'Veterinary'}
        </span>
      </div>

      <div className="doctor-card__avatar">
        {image ? (
          <img src={image} alt={name} />
        ) : (
          <span aria-hidden="true">
            {name.charAt(0).toUpperCase()}
          </span>
        )}
      </div>

      <div className="doctor-card__body">
        <p className="doctor-card__verification">
          {verified
            ? 'VERIFIED PROFILE'
            : 'EXAMPLE PROFILE · NOT VERIFIED'}
        </p>

        <h3 className="doctor-card__name">{name}</h3>

        <p className="doctor-card__specialty">{specialty}</p>

        {location && (
          <p className="doctor-card__location">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinejoin="round"
              />
              <circle
                cx="12"
                cy="10"
                r="2.3"
                stroke="currentColor"
                strokeWidth="1.7"
              />
            </svg>
            <span>{location}</span>
          </p>
        )}

        <div className="doctor-card__actions">
          <button
            type="button"
            className="doctor-card__view-button"
            onClick={(event) => {
              event.stopPropagation();
              onViewProfile?.(doctor.username || doctor.id || doctor.pk);
            }}
          >
            <span>View page</span>
            <span className="doctor-card__external" aria-hidden="true">
              ↗
            </span>
          </button>

          <button
            type="button"
            className="doctor-card__connect-button"
            aria-label={`Connect with ${name}`}
            title={`Connect with ${name}`}
            onClick={(event) => {
              event.stopPropagation();
              onConnect?.(doctor);
            }}
          >
            +
          </button>
        </div>
      </div>
    </article>
  );
}
