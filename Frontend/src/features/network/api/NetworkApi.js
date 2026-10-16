
const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api'
).replace(/\/+$/, '');

async function apiRequest(path, options = {}) {
  const token = localStorage.getItem('zenveAccessToken');

  const headers = {
    Accept: 'application/json',
    ...options.headers,
  };

  if (options.body && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
    credentials: 'include',
  });

  const responseText = await response.text();
  let data = null;

  if (responseText) {
    try {
      data = JSON.parse(responseText);
    } catch {
      data = responseText;
    }
  }

  if (!response.ok) {
    const message =
      typeof data === 'object' && data !== null
        ? data.detail ||
          data.message ||
          data.error ||
          JSON.stringify(data)
        : data || `Request failed (${response.status})`;

    throw new Error(
      `${message} [HTTP ${response.status}: ${path}]`
    );
  }

  return data;
}

// Doctor directory
export function getDoctors(params = {}) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.set(key, String(value));
    }
  });

  const suffix = query.toString() ? `?${query.toString()}` : '';

  return apiRequest(`/connections/doctors/${suffix}`);
}

// Public doctor profile
export function getDoctorByUsername(username) {
  return apiRequest(
    `/accounts/doctors/${encodeURIComponent(username)}/`
  );
}

// List all, incoming, or outgoing connection requests
export function getConnectionRequests(direction = 'all') {
  if (!['all', 'incoming', 'outgoing'].includes(direction)) {
    throw new Error('Direction must be all, incoming, or outgoing.');
  }

  const query = new URLSearchParams({ direction });

  return apiRequest(`/connections/requests/?${query.toString()}`);
}

// Send a connection request
export function sendConnectionRequest(username) {
  if (!username || !username.trim()) {
    throw new Error('A doctor username is required.');
  }

  return apiRequest('/connections/requests/', {
    method: 'POST',
    body: JSON.stringify({ username: username.trim() }),
  });
}

// Accept, reject, or cancel a request
export function respondToConnectionRequest(id, action) {
  if (!id) {
    throw new Error('A connection request ID is required.');
  }

  if (!['accept', 'reject', 'cancel'].includes(action)) {
    throw new Error('Action must be accept, reject, or cancel.');
  }

  return apiRequest(`/connections/requests/${id}/action/`, {
    method: 'POST',
    body: JSON.stringify({ action }),
  });
}

// Get accepted connections
export function getAcceptedConnections() {
  return apiRequest('/connections/accepted/');
}
