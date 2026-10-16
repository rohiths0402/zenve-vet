import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import DoctorCard from '../components/DoctorCard';
import './SearchPage.css';

const MOCK_DOCTORS = [
  {
    id: 1,
    full_name: 'Dr. Arun Kumar',
    specialty: 'Veterinary Surgeon',
    city: 'Chennai',
    about: 'Experienced in small animal surgery and clinical care.',
  },
  {
    id: 2,
    full_name: 'Dr. Priya Sharma',
    specialty: 'Veterinary Dermatology',
    city: 'Coimbatore',
    about: 'Focused on animal skin conditions and preventive care.',
  },
  {
    id: 3,
    full_name: 'Dr. Karthik Raj',
    specialty: 'Veterinary Physician',
    city: 'Bengaluru',
    about: 'Interested in companion animal medicine and diagnostics.',
  },
  {
    id: 4,
    full_name: 'Dr. Meena Devi',
    specialty: 'Veterinary Dentistry',
    city: 'Madurai',
    about: 'Provides dental care and oral health guidance for pets.',
  },
];

export default function SearchPage() {
  const navigate = useNavigate();

  const [query, setQuery] = useState('');
  const [specialty, setSpecialty] = useState('all');
  const [location, setLocation] = useState('');

  const specialties = useMemo(
    () => [...new Set(MOCK_DOCTORS.map((doctor) => doctor.specialty))],
    []
  );

  const filteredDoctors = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const normalizedLocation = location.trim().toLowerCase();

    return MOCK_DOCTORS.filter((doctor) => {
      const matchesQuery =
        !normalizedQuery ||
        [
          doctor.full_name,
          doctor.specialty,
          doctor.city,
          doctor.about,
        ].some((value) =>
          String(value ?? '').toLowerCase().includes(normalizedQuery)
        );

      const matchesSpecialty =
        specialty === 'all' || doctor.specialty === specialty;

      const matchesLocation =
        !normalizedLocation ||
        doctor.city.toLowerCase().includes(normalizedLocation);

      return matchesQuery && matchesSpecialty && matchesLocation;
    });
  }, [query, specialty, location]);

  function clearFilters() {
    setQuery('');
    setSpecialty('all');
    setLocation('');
  }

  function handleConnect(doctor) {
    // Connection requests will be integrated with the backend later.
    navigate('/network', {
      state: {
        message: `You selected ${doctor.full_name}. Connection requests will be enabled after backend integration.`,
      },
    });
  }

  return (
    <main className="vet-search-page">
      <section className="vet-search-hero">
        <p className="vet-search-eyebrow">ZENVE VET COMMUNITY</p>
        <h1>Find Veterinary Professionals</h1>
        <p>
          Search for veterinarians, explore specialties, and discover
          professionals across the veterinary community.
        </p>
      </section>

      <section className="vet-search-content">
        <div className="vet-search-heading">
          <div>
            <h2>Search professionals</h2>
            <p>Use the filters below to find the right professional.</p>
          </div>

          <span className="vet-search-count">
            {filteredDoctors.length}{' '}
            {filteredDoctors.length === 1 ? 'professional' : 'professionals'}
          </span>
        </div>

        <div className="vet-search-filters">
          <div className="vet-search-field vet-search-field--wide">
            <label htmlFor="doctor-search">Name or specialty</label>
            <input
              id="doctor-search"
              type="search"
              placeholder="Search by name, specialty, or keyword..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>

          <div className="vet-search-field">
            <label htmlFor="doctor-specialty">Specialty</label>
            <select
              id="doctor-specialty"
              value={specialty}
              onChange={(event) => setSpecialty(event.target.value)}
            >
              <option value="all">All specialties</option>
              {specialties.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div className="vet-search-field">
            <label htmlFor="doctor-location">Location</label>
            <input
              id="doctor-location"
              type="text"
              placeholder="Enter city..."
              value={location}
              onChange={(event) => setLocation(event.target.value)}
            />
          </div>

          <button
            type="button"
            className="vet-search-clear"
            onClick={clearFilters}
          >
            Clear filters
          </button>
        </div>

        <div className="vet-search-results-heading">
          <h2>Search results</h2>
          <span>{filteredDoctors.length} found</span>
        </div>

        {filteredDoctors.length > 0 ? (
          <div className="vet-search-grid">
            {filteredDoctors.map((doctor) => (
              <DoctorCard
                key={doctor.id}
                doctor={doctor}
                onViewProfile={(id) => navigate(`/doctors/${id}`)}
                onConnect={handleConnect}
              />
            ))}
          </div>
        ) : (
          <div className="vet-search-empty">
            <h3>No professionals found</h3>
            <p>
              Try another keyword, select a different specialty,
              or change the location.
            </p>
            <button type="button" onClick={clearFilters}>
              Clear all filters
            </button>
          </div>
        )}
      </section>
    </main>
  );
}
