
const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  "http://127.0.0.1:8000/api"
).replace(/\/+$/, "");

function getToken() {
  return localStorage.getItem("zenveAccessToken") || "";
}

async function apiRequest(path, options = {}) {
  const token = getToken();

  const headers = {
    Accept: "application/json",
    ...(options.body instanceof FormData
      ? {}
      : options.body
        ? { "Content-Type": "application/json" }
        : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  let response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      credentials: "include",
      headers,
    });
  } catch {
    throw new Error(
      "Cannot connect to the backend. Check that Django is running."
    );
  }

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
    let message = "";

    if (typeof data === "string") {
      message = data;
    } else if (data && typeof data === "object") {
      message =
        data.detail ||
        data.message ||
        Object.entries(data)
          .map(([key, value]) => {
            const description = Array.isArray(value)
              ? value.join(" ")
              : typeof value === "string"
                ? value
                : JSON.stringify(value);

            return `${key}: ${description}`;
          })
          .join(" ");
    }

    throw new Error(
      message || `API request failed (${response.status}).`
    );
  }

  return data;
}

function extractList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.data?.results)) return data.data.results;
  if (Array.isArray(data?.posts)) return data.posts;

  throw new Error("Unexpected response format from the API.");
}

// Fetch all feed posts.
export async function fetchFeedPosts({ signal } = {}) {
  const data = await apiRequest("/posts/", { signal });
  return extractList(data);
}

// Fetch clinical case posts.
export async function fetchClinicalCases({ signal } = {}) {
  const data = await apiRequest("/posts/?type=case", { signal });
  return extractList(data);
}

// Create a text, image, video, or clinical case post.
export async function createFeedPost(payload) {
  return apiRequest("/posts/", {
    method: "POST",
    body:
      payload instanceof FormData
        ? payload
        : JSON.stringify(payload),
  });
}

// Upload an image or video before creating the post.
export async function uploadPostMedia(file, mediaType) {
  if (!(file instanceof File)) {
    throw new Error("Please select a media file.");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("media_type", mediaType);

  return apiRequest("/posts/upload-media/", {
    method: "POST",
    body: formData,
  });
}

// Create a clinical case with consent validation.
export async function createClinicalCase({
  caseTitle,
  caseSummary,
  findings = "",
  treatment = "",
  consentConfirmed,
}) {
  const title = (caseTitle || "").trim();
  const summary = (caseSummary || "").trim();

  if (!title || !summary) {
    throw new Error("Case title and summary are required.");
  }

  if (!consentConfirmed) {
    throw new Error(
      "Confirm consent and removal of identifying details before publishing."
    );
  }

  return createFeedPost({
    content_type: "case",
    caption: summary,
    media_url: "",
    thumbnail_url: "",
    clinical_case: {
      case_title: title,
      case_summary: summary,
      findings: findings.trim(),
      treatment: treatment.trim(),
      consent_confirmed: true,
    },
  });
}

// Like a post.
export async function likeFeedPost(postId) {
  if (postId === undefined || postId === null || postId === "") {
    throw new Error("A valid post ID is required.");
  }

  return apiRequest(
    `/posts/${encodeURIComponent(postId)}/like/`,
    { method: "POST" }
  );
}

// Unlike a post.
export async function unlikeFeedPost(postId) {
  if (postId === undefined || postId === null || postId === "") {
    throw new Error("A valid post ID is required.");
  }

  return apiRequest(
    `/posts/${encodeURIComponent(postId)}/like/`,
    { method: "DELETE" }
  );
}
