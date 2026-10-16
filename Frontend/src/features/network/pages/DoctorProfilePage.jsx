import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import DoctorCard from '../components/DoctorCard';
import './DoctorProfilePage.css';

// Temporary mock data for frontend testing.
// Replace this with API data during backend integration.
const MOCK_DOCTORS = [
  {
    id: 1,
    full_name: 'Dr. Arun Kumar',
    specialty: 'Veterinary Surgeon',
    city: 'Chennai',
    about:
      'Experienced in small animal surgery and clinical care. Passionate about improving animal health through preventive medicine and responsible treatment.',
    experience: '8 years',
    hospital: 'Chennai Veterinary Care',
    qualifications: ['BVSc', 'MVSc - Veterinary Surgery'],
    interests: ['Small Animal Surgery', 'Pet Health', 'Preventive Care'],
  },
  {
    id: 2,
    full_name: 'Dr. Priya Sharma',
    specialty: 'Veterinary Dermatology',
    city: 'Coimbatore',
    about:
      'Focused on animal skin conditions, dermatological treatment, and preventive care for companion animals.',
    experience: '6 years',
    hospital: 'Coimbatore Animal Clinic',
    qualifications: ['BVSc', 'MVSc - Veterinary Medicine'],
    interests: ['Veterinary Dermatology', 'Pet Wellness', 'Research'],
  },
  {
    id: 3,
    full_name: 'Dr. Karthik Raj',
    specialty: 'Veterinary Physician',
    city: 'Bengaluru',
    about:
      'Interested in companion animal medicine, diagnostic procedures, and collaborative veterinary practice.',
    experience: '5 years',
    hospital: 'Bengaluru Veterinary Centre',
    qualifications: ['BVSc'],
    interests: ['Animal Medicine', 'Diagnostics', 'Clinical Research'],
  },
  {
    id: 4,
    full_name: 'Dr. Meena Devi',
    specialty: 'Veterinary Dentistry',
    city: 'Madurai',
    about:
      'Provides veterinary dental care and guidance to improve the oral health and wellbeing of companion animals.',
    experience: '4 years',
    hospital: 'Madurai Pet Health Clinic',
    qualifications: ['BVSc', 'Veterinary Dental Training'],
    interests: ['Veterinary Dentistry', 'Pet Oral Health', 'Preventive Care'],
  },
];

export default function DoctorProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [notice, setNotice] = useState('');

  const doctor = useMemo(
    () => MOCK_DOCTORS.find((item) => String(item.id) === String(id)),
    [id]
  );

  if (!doctor) {
    return (
      <main className="doctor-profile-page">
        <section className="doctor-profile-state">
          <div className="doctor-profile-state__icon" aria-hidden="true">
            ?
          </div>
          <h1>Professional not found</h1>
          <p>
            This profile is unavailable in the current demo data.
            Return to the Network page to explore professionals.
          </p>
          <button
            type="button"
            className="doctor-profile-button doctor-profile-button--primary"
            onClick={() => navigate('/network')}
          >
            Back to Network
          </button>
        </section>
      </main>
    );
  }

  const initials = doctor.full_name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');

  function handleConnect() {
    setNotice(
      `Connection requests for ${doctor.full_name} will be available after backend integration.`
    );
  }

  return (
    <main className="doctor-profile-page">
      <button
        type="button"
        className="doctor-profile-back"
        onClick={() => navigate(-1)}
      >
        <span aria-hidden="true">←</span> Back
      </button>

      <section className="doctor-profile-hero">
        <div className="doctor-profile-avatar" aria-hidden="true">
          {initials || 'V'}
        </div>

        <div className="doctor-profile-identity">
          <p className="doctor-profile-eyebrow">
            ZENVE VET COMMUNITY
          </p>
          <h1>{doctor.full_name}</h1>
          <p className="doctor-profile-specialty">
            {doctor.specialty}
          </p>
          <p className="doctor-profile-location">
            <span aria-hidden="true">⌖</span> {doctor.city}
          </p>
        </div>

        <button
          type="button"
          className="doctor-profile-button doctor-profile-button--light"
          onClick={handleConnect}
        >
          Connect
        </button>
      </section>

      {notice && (
        <p className="doctor-profile-notice" role="status">
          {notice}
        </p>
      )}

      <div className="doctor-profile-layout">
        <div className="doctor-profile-main">
          <section className="doctor-profile-card">
            <h2>About</h2>
            <p className="doctor-profile-about">{doctor.about}</p>
          </section>

          <section className="doctor-profile-card">
            <h2>Qualifications</h2>
            <ul className="doctor-profile-list">
              {doctor.qualifications.map((qualification) => (
                <li key={qualification}>
                  <span
                    className="doctor-profile-list-marker"
                    aria-hidden="true"
                  >
                    ✓
                  </span>
                  {qualification}
                </li>
              ))}
            </ul>
          </section>

          <section className="doctor-profile-card">
            <h2>Professional interests</h2>
            <div className="doctor-profile-tags">
              {doctor.interests.map((interest) => (
                <span key={interest} className="doctor-profile-tag">
                  {interest}
                </span>
              ))}
            </div>
          </section>
        </div>

        <aside className="doctor-profile-sidebar">
          <section className="doctor-profile-card">
            <h2>Professional details</h2>

            <div className="doctor-profile-detail">
              <span>Specialty</span>
              <strong>{doctor.specialty}</strong>
            </div>

            <div className="doctor-profile-detail">
              <span>Experience</span>
              <strong>{doctor.experience}</strong>
            </div>

            <div className="doctor-profile-detail">
              <span>Location</span>
              <strong>{doctor.city}</strong>
            </div>

            <div className="doctor-profile-detail">
              <span>Organization</span>
              <strong>{doctor.hospital}</strong>
            </div>
          </section>

          <section className="doctor-profile-card doctor-profile-related">
            <h2>Explore more</h2>
            <p>Discover other veterinary professionals in the community.</p>
            <button
              type="button"
              className="doctor-profile-button doctor-profile-button--primary"
              onClick={() => navigate('/network')}
            >
              View Network
            </button>
            <button
              type="button"
              className="doctor-profile-button doctor-profile-button--secondary"
              onClick={() => navigate('/search')}
            >
              Search Professionals
            </button>
          </section>
        </aside>
      </div>
    </main>
  );
}