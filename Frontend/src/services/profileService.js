const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

const getHeaders = () => {
  const token = localStorage.getItem("token");

  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export async function getMyProfile() {
  const response = await fetch(`${API_BASE_URL}/api/profile`, {
    method: "GET",
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch profile: ${response.status}`);
  }

  return response.json();
}

export async function updateMyProfile(profile) {
  const response = await fetch(`${API_BASE_URL}/api/profile`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(profile),
  });

  if (!response.ok) {
    throw new Error(`Failed to update profile: ${response.status}`);
  }

  return response.json();
}
