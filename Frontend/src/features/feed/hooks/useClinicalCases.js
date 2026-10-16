
import { useCallback, useEffect, useState } from 'react';
import { fetchClinicalCases } from '../service/clinicalCaseService.js';

export default function useClinicalCases() {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadCases = useCallback(async (signal) => {
    setLoading(true);
    setError('');

    try {
      const data = await fetchClinicalCases({ signal });

      if (!signal?.aborted) {
        setCases(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      if (err.name !== 'AbortError' && !signal?.aborted) {
        setError(err.message || 'Failed to load clinical cases.');
      }
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    loadCases(controller.signal);

    return () => controller.abort();
  }, [loadCases]);

  const refresh = useCallback(() => {
    return loadCases();
  }, [loadCases]);

  return { cases, loading, error, refresh };
}
