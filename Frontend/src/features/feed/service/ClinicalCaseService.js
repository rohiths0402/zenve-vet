
const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  'http://127.0.0.1:8000/api'
).replace(/\/$/, '');

// Confirm this endpoint against your Django backend URLs.
const CLINICAL_CASES_ENDPOINT = '/clinical-cases/';

async function apiRequest(path, { signal } = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
    credentials: 'include',
    signal,
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(
      message || `Clinical cases request failed: ${response.status}`
    );
  }

  return response.json();
}

export async function fetchClinicalCases({ signal } = {}) {
  const data = await apiRequest(CLINICAL_CASES_ENDPOINT, { signal });

  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.results)) {
    return data.results;
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  throw new Error('Unexpected response format from the clinical cases API.');
}
