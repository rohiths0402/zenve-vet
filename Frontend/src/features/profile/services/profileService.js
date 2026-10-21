
const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  "http://127.0.0.1:8000/api"
).replace(/\/+$/, "");

export async function uploadProfilePhoto(file) {
  if (!file) {
    throw new Error("Please select a profile photo.");
  }

  const token = localStorage.getItem("zenveAccessToken");

  if (!token) {
    throw new Error("Please log in again.");
  }

  const formData = new FormData();
  formData.append("profile_photo_file", file);

  const response = await fetch(
    `${API_BASE_URL}/accounts/profile/`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    }
  );

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data.detail ||
      data.error ||
      JSON.stringify(data) ||
      "Profile photo upload failed."
    );
  }

  if (!data.profile_photo_url) {
    throw new Error(
      "The API response does not contain profile_photo_url."
    );
  }

  localStorage.setItem(
    "zenveProfilePhotoUrl",
    data.profile_photo_url
  );

  window.dispatchEvent(new Event("zenve-profile-updated"));

  return data;
}
