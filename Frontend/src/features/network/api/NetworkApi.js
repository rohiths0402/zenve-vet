
const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'
).replace(/\/$/, '');

async function request(path, { signal } = {}) {
  let response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      credentials: 'include',
      signal,
    });
  } catch (error) {
    if (error.name === 'AbortError') {
      throw error;
    }

    throw new Error(
      'Cannot connect to the server. Please check the backend connection.'
    );
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      data?.detail ||
        data?.message ||
        data?.error ||
        `Request failed (${response.status})`
    );
  }

  return data;
}

function extractList(data) {
  if (Array.isArray(data)) return data;

  const candidates = [
    data?.doctors,
    data?.results,
    data?.data,
    data?.content,
  ];

  return candidates.find(Array.isArray) ?? null;
}

export async function getDoctors({ signal } = {}) {
  const data = await request('/api/doctors/', { signal });
  const doctors = extractList(data);

  if (!doctors) {
    throw new Error('The doctors API returned an unexpected response.');
  }

  return doctors;
}

export async function getDoctorById(id, { signal } = {}) {
  if (id === undefined || id === null || String(id).trim() === '') {
    throw new Error('A doctor ID is required.');
  }

  return request(`/api/doctors/${encodeURIComponent(id)}/`, { signal });
}
