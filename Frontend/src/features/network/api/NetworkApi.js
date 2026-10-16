const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'
).replace(/\/$/, '');

async function request(path, { signal, method = 'GET', body } = {}) {
  let response;
  const headers = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  // Supports JWT-based API sessions if the auth service stores an access token.
  try {
    const stored = JSON.parse(localStorage.getItem('zenveUser') || 'null');
    const token = stored?.access || stored?.access_token || stored?.token;
    if (token) headers.Authorization = `Bearer ${token}`;
  } catch { /* ignore invalid local storage */ }

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method, headers, credentials: 'include', signal,
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });
  } catch (error) {
    if (error.name === 'AbortError') throw error;
    throw new Error('Cannot connect to the server. Please check the backend connection.');
  }
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      throw new Error('Please sign in with a backend-authenticated account to send connection requests.');
    }
    throw new Error(data?.detail || data?.message || data?.error || `Request failed (${response.status})`);
  }
  return data;
}

function extractList(data) {
  if (Array.isArray(data)) return data;
  return [data?.doctors, data?.results, data?.data, data?.content].find(Array.isArray) ?? null;
}

export async function getDoctors({ signal } = {}) {
  const data = await request('/api/doctors/', { signal });
  const doctors = extractList(data);
  if (!doctors) throw new Error('The doctors API returned an unexpected response.');
  return doctors;
}

export async function getDoctorById(id, { signal } = {}) {
  if (id === undefined || id === null || String(id).trim() === '') throw new Error('A doctor ID is required.');
  return request(`/api/doctors/${encodeURIComponent(id)}/`, { signal });
}

export async function sendConnectionRequest(receiverId, message = '') {
  return request('/api/connections/', { method: 'POST', body: { receiver_id: receiverId, message } });
}

export async function getConnectionRequests(direction = 'received', status = 'pending') {
  const params = new URLSearchParams({ direction });
  if (status) params.set('status', status);
  return request(`/api/connections/?${params.toString()}`);
}

export async function respondToConnectionRequest(requestId, action) {
  return request(`/api/connections/${encodeURIComponent(requestId)}/respond/`, {
    method: 'POST', body: { action },
  });
}
