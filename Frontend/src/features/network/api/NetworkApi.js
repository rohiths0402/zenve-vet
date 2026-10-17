const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  'http://127.0.0.1:8000/api'
).replace(/\/+$/, '');

function getToken() {
  return localStorage.getItem('zenveAccessToken') || '';
}

async function apiRequest(path, options = {}) {
  const token = getToken();

  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: 'include',
    ...options,
    headers: {
      Accept: 'application/json',
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

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

// Doctor directory
export function getDoctors() {
  return apiRequest('/connections/doctors/');
}

// Public doctor profile
export function getDoctorByUsername(username) {
  return apiRequest(
    `/accounts/doctors/${encodeURIComponent(username)}/`
  );
}

// Connection requests
export function getConnectionRequests(direction = 'incoming') {
  const params = new URLSearchParams({ direction });

  return apiRequest(`/connections/requests/?${params.toString()}`);
}

export function sendConnectionRequest(username) {
  return apiRequest('/connections/requests/', {
    method: 'POST',
    body: JSON.stringify({ username }),
  });
}

export function respondToConnectionRequest(id, action) {
  return apiRequest(
    `/connections/requests/${encodeURIComponent(id)}/action/`,
    {
      method: 'POST',
      body: JSON.stringify({ action }),
    }
  );
}

// Accepted connections
export function getAcceptedConnections() {
  return apiRequest('/connections/accepted/');
}

// Withdraw/cancel a sent request
export function withdrawConnectionRequest(id) {
  return respondToConnectionRequest(id, 'cancel');
}