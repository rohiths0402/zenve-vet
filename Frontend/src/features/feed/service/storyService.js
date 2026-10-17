
const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  "http://127.0.0.1:8000/api"
).replace(/\/+$/, "");

function getToken() {
  return localStorage.getItem("zenveAccessToken") || "";
}

function getHeaders() {
  const token = getToken();

  return {
    Accept: "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function handleResponse(response) {
  if (!response.ok) {
    const message = await response.text().catch(() => "");
    throw new Error(
      message || `Request failed with status ${response.status}`
    );
  }

  if (response.status === 204) return null;

  return response.json();
}

function extractStories(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  if (Array.isArray(data?.stories)) return data.stories;
  return [];
}

// Fetch all stories for the feed.
export async function fetchStories() {
  const response = await fetch(`${API_BASE_URL}/stories/`, {
    method: "GET",
    headers: getHeaders(),
  });

  const data = await handleResponse(response);
  return extractStories(data);
}

// Fetch stories created by the logged-in doctor.
export async function fetchMyStories() {
  const response = await fetch(`${API_BASE_URL}/stories/mine/`, {
    method: "GET",
    headers: getHeaders(),
  });

  const data = await handleResponse(response);
  return extractStories(data);
}

// Create a story with an image and optional caption.
export async function createStory({ image, caption = "" } = {}) {
  if (!image) {
    throw new Error("Please select an image for your story.");
  }

  const formData = new FormData();
  formData.append("image", image);
  formData.append("caption", caption);

  const response = await fetch(`${API_BASE_URL}/stories/`, {
    method: "POST",
    headers: {
      ...(getToken()
        ? { Authorization: `Bearer ${getToken()}` }
        : {}),
    },
    body: formData,
  });

  return handleResponse(response);
}

export default {
  fetchStories,
  fetchMyStories,
  createStory,
};
