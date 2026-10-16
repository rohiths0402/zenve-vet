
const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  "http://127.0.0.1:8000/api"
).replace(/\/+$/, "");

function getToken() {
  return localStorage.getItem("zenveAccessToken") || "";
}

async function apiRequest(path, options = {}) {
  const token = getToken();

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
    const message =
      data?.detail ||
      data?.message ||
      (data && typeof data === "object"
        ? Object.entries(data)
            .map(([key, value]) => {
              const description = Array.isArray(value)
                ? value.join(" ")
                : typeof value === "string"
                  ? value
                  : JSON.stringify(value);

              return `${key}: ${description}`;
            })
            .join(" ")
        : null) ||
      `API request failed (${response.status}).`;

    throw new Error(message);
  }

  return data;
}

function extractList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  if (Array.isArray(data?.data)) return data.data;

  throw new Error("Unexpected response format from the API.");
}

export async function fetchFeedPosts({ signal } = {}) {
  const data = await apiRequest("/posts/", { signal });
  return extractList(data);
}

export async function fetchClinicalCases({ signal } = {}) {
  const data = await apiRequest("/posts/?type=case", { signal });
  return extractList(data);
}

export async function createFeedPost(payload) {
  const body =
    payload instanceof FormData
      ? payload
      : JSON.stringify(payload);

  const data = await apiRequest("/posts/", {
    method: "POST",
    body,
  });

  return data?.data ?? data;
}

export async function createClinicalCase({
  caseTitle,
  caseSummary,
  findings = "",
  treatment = "",
  consentConfirmed,
}) {
  const title = caseTitle.trim();
  const summary = caseSummary.trim();

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

export async function likeFeedPost(postId) {
  return apiRequest(
    `/posts/${encodeURIComponent(postId)}/like/`,
    { method: "POST" }
  );
}

export async function unlikeFeedPost(postId) {
  return apiRequest(
    `/posts/${encodeURIComponent(postId)}/like/`,
    { method: "DELETE" }
  );
}
