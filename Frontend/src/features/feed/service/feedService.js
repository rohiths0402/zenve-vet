
const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  'http://127.0.0.1:8000/api'
).replace(/\/$/, '');

// Verify this endpoint against your Django posts/urls.py.
const FEED_ENDPOINT = '/posts/';

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
      message || `Feed request failed with status ${response.status}`
    );
  }

  return response.json();
}

export async function fetchFeedPosts({ signal } = {}) {
  const data = await apiRequest(FEED_ENDPOINT, { signal });

  // Django REST Framework pagination.
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.results)) {
    return data.results;
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  throw new Error('Unexpected response format from the feed API.');
}
