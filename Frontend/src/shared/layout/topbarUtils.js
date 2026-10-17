const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  "http://127.0.0.1:8000/api"
).replace(/\/+$/, "");

export const AUTH_STORAGE_KEY = "zenveAccessToken";
export const AUTH_EVENT = "zenve-auth-changed";
export const PROFILE_UPDATED_EVENT = "zenve-profile-updated";

const BACKEND_URL = API_BASE_URL.replace(/\/api\/?$/i, "");

export function resolveImageUrl(value) {
  if (!value || typeof value !== "string") return "";

  const url = value.trim();
  if (!url) return "";

  if (/^(https?:|data:|blob:)/i.test(url)) return url;

  if (url.startsWith("//")) {
    return `${window.location.protocol}${url}`;
  }

  return `${BACKEND_URL}/${url.replace(/^\/+/, "")}`;
}

export function getStoredUser() {
  // The user is logged out if the access token is missing.
  if (!localStorage.getItem(AUTH_STORAGE_KEY)) {
    return null;
  }

  const keys = [
    "zenveUser",
    "zenve_user",
    "user",
    "currentUser",
  ];

  for (const key of keys) {
    try {
      const value = localStorage.getItem(key);
      if (!value) continue;

      const parsed = JSON.parse(value);

      if (!parsed || typeof parsed !== "object") continue;

      const user =
        parsed.user ??
        parsed.data?.user ??
        parsed.data ??
        parsed;

      if (
        user &&
        typeof user === "object" &&
        !Array.isArray(user) &&
        (
          user.id != null ||
          user.user_id != null ||
          user.email ||
          user.username
        )
      ) {
        return user;
      }
    } catch {
      // Try the next storage key.
    }
  }

  return null;
}

export function getUserInitial(user) {
  const name =
    user?.full_name ||
    user?.fullName ||
    user?.name ||
    user?.username ||
    user?.email ||
    "V";

  return String(name).trim().charAt(0).toUpperCase() || "V";
}

export function getProfilePicture(user) {
  const picture =
    user?.profile_photo_url ||
    user?.profile_picture ||
    user?.profilePicture ||
    user?.avatar_url ||
    user?.avatar ||
    user?.doctor_profile?.profile_photo_url ||
    localStorage.getItem("zenveProfilePhotoUrl") ||
    "";

  return resolveImageUrl(picture);
}

export async function fetchCurrentProfile() {
  const token = localStorage.getItem(AUTH_STORAGE_KEY);

  if (!token) return null;

  const response = await fetch(`${API_BASE_URL}/accounts/profile/`, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Unable to load profile (${response.status}).`);
  }

  const data = await response.json();
  const profile = data.profile || data.user || data;

  if (profile.profile_photo_url) {
    localStorage.setItem(
      "zenveProfilePhotoUrl",
      profile.profile_photo_url
    );
  }

  const existing = getStoredUser() || {};
  const updated = { ...existing, ...profile };

  localStorage.setItem("zenveUser", JSON.stringify(updated));

  return updated;
}