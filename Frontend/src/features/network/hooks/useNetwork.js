
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getDoctors } from '../api/NetworkApi';

function extractDoctors(response) {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.results)) {
    return response.results;
  }

  if (Array.isArray(response?.doctors)) {
    return response.doctors;
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  return [];
}

export default function useNetwork() {
  const [doctors, setDoctors] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const response = await getDoctors();
      setDoctors(extractDoctors(response));
    } catch (err) {
      setDoctors([]);
      setError(err?.message || 'Unable to load doctors.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const visibleDoctors = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return doctors;
    }

    return doctors.filter((doctor) => {
      const searchableText = [
        doctor.fullName,
        doctor.full_name,
        doctor.name,
        doctor.username,
        doctor.specialty,
        doctor.specialization,
        doctor.city,
        doctor.state,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return searchableText.includes(query);
    });
  }, [doctors, search]);

  return {
    doctors: visibleDoctors,
    search,
    setSearch,
    loading,
    error,
    refresh,
  };
}
