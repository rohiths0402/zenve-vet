
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getDoctors } from '../api/NetworkApi';

export default function useNetwork() {
  const [doctors, setDoctors] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDoctors = useCallback(async (signal) => {
    setLoading(true);
    setError('');

    try {
      const result = await getDoctors({ signal });
      setDoctors(result);
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err.message || 'Unable to load doctors.');
      }
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    loadDoctors(controller.signal);

    return () => controller.abort();
  }, [loadDoctors]);

  const filteredDoctors = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return doctors;

    return doctors.filter((doctor) => {
      const searchableFields = [
        doctor.name,
        doctor.full_name,
        doctor.username,
        doctor.specialty,
        doctor.specialization,
        doctor.city,
        doctor.location,
        doctor.hospital,
      ];

      return searchableFields.some((value) =>
        String(value ?? '').toLowerCase().includes(query)
      );
    });
  }, [doctors, search]);

  const refresh = useCallback(() => {
    loadDoctors();
  }, [loadDoctors]);

  return {
    doctors: filteredDoctors,
    allDoctors: doctors,
    search,
    setSearch,
    loading,
    error,
    refresh,
  };
}
