
const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  "http://127.0.0.1:8000/api"
).replace(/\/+$/, "");

async function reelsRequest(path, options = {}) {
  const token = localStorage.getItem("zenveAccessToken");

  let response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      credentials: "include",
      headers: {
        Accept: "application/json",
        ...(options.body instanceof FormData
          ? {}
          : options.body
            ? { "Content-Type": "application/json" }
            : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });
  } catch {
    throw new Error(
      "Cannot connect to the backend. Check that Django is running."
    );
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const detail =
      data?.detail ||
      (data && typeof data === "object"
        ? Object.values(data).flat().join(" ")
        : null);

    throw new Error(
      detail || `Video request failed (${response.status}).`
    );
  }

  return data;
}

function extractVideos(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

/**
 * Load only video posts.
 */
export async function fetchShortVideos({ signal } = {}) {
  const data = await reelsRequest("/posts/?type=video", { signal });

  return extractVideos(data).filter(
    (post) =>
      String(post?.content_type || "").toLowerCase() === "video"
  );
}

/**
 * Publish a video post using an already accessible video URL.
 * This does not upload a local video file.
 */
export async function createShortVideo({
  caption = "",
  media_url,
  thumbnail_url = "",
}) {
  if (!media_url || typeof media_url !== "string") {
    throw new Error("A valid video URL is required.");
  }

  return reelsRequest("/posts/", {
    method: "POST",
    body: JSON.stringify({
      content_type: "video",
      caption,
      media_url,
      thumbnail_url,
      is_published: true,
    }),
  });
}

/**
 * Like a video post.
 */
export async function likeFeedPost(postId) {
  if (postId == null) {
    throw new Error("A valid video post ID is required.");
  }

  return reelsRequest(
    `/posts/${encodeURIComponent(postId)}/like/`,
    { method: "POST" }
  );
}

/**
 * Unlike a video post.
 */
export async function unlikeFeedPost(postId) {
  if (postId == null) {
    throw new Error("A valid video post ID is required.");
  }

  return reelsRequest(
    `/posts/${encodeURIComponent(postId)}/like/`,
    { method: "DELETE" }
  );
}
