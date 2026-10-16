
const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  'http://127.0.0.1:8000/api'
).replace(/\/+$/, '');

async function storyRequest(path, options = {}) {
  const token = localStorage.getItem('zenveAccessToken');

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      credentials: 'include',
      headers: {
      Accept: 'application/json',
      ...(options.body instanceof FormData
        ? {}
        : options.body
          ? { 'Content-Type': 'application/json' }
          : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
      },
    });
  } catch {
    throw new Error('Cannot connect to the backend. Check that Django is running.');
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const detail =
      data?.detail ||
      (typeof data === 'object' && data
        ? Object.values(data).flat().join(' ')
        : null);

    throw new Error(detail || `Stories request failed (${response.status}).`);
  }

  return data;
}

function extractStories(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

export async function fetchStories({ signal } = {}) {
  const data = await storyRequest('/stories/', { signal });
  return extractStories(data);
}

export async function fetchMyStories({ signal } = {}) {
  const data = await storyRequest('/stories/mine/', { signal });
  return extractStories(data);
}

export async function createStory({ image, caption = '' }) {
  if (!(image instanceof File)) {
    throw new Error('Choose an image for your story first.');
  }

  const formData = new FormData();
  formData.append('image', image);
  formData.append('caption', caption);

  return storyRequest('/stories/', {
    method: 'POST',
    body: formData,
  });
}
