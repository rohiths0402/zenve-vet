
import { AUTH_STORAGE_KEY } from "../../../shared/layout/topbarUtils.js";

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api"
).replace(/\/+$/, "");

const API_BASE = `${API_BASE_URL}/messaging`;
const ACCESS_TOKEN_KEY = "zenveAccessToken";
const META_KEY = "zenvet_thread_meta";

const ENDPOINTS = {
  CONVERSATIONS: `${API_BASE}/conversations/`,
  MESSAGES: (conversationId) =>
    `${API_BASE}/conversations/${conversationId}/messages/`,
  READ: (conversationId) =>
    `${API_BASE}/conversations/${conversationId}/read/`,
  UNREAD_COUNT: `${API_BASE}/messages/unread-count/`,
};

export const DEFAULT_META = {
  starred: false,
  muted: false,
  archived: false,
  blocked: false,
  reported: false,
  unread: 0,
};

function read(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage may be unavailable or full.
  }
}

function getRows(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.data?.results)) return data.data.results;
  if (Array.isArray(data?.conversations)) return data.conversations;
  if (Array.isArray(data?.messages)) return data.messages;
  return [];
}

function getMetaMap() {
  return read(META_KEY, {});
}

function getMeta(conversationId) {
  return {
    ...DEFAULT_META,
    ...(getMetaMap()[String(conversationId)] || {}),
  };
}

function patchMeta(conversationId, changes) {
  const id = String(conversationId);
  const all = getMetaMap();

  all[id] = {
    ...DEFAULT_META,
    ...(all[id] || {}),
    ...changes,
  };

  write(META_KEY, all);
  return all[id];
}

/**
 * Get the logged-in user profile.
 *
 * Check the existing application's auth storage key first.
 * Fall back to zenveUser if the application stores the profile there.
 * The access token is read separately and is never treated as profile data.
 */
export function getProfile() {
  const user =
    read(AUTH_STORAGE_KEY, null) ||
    read("zenveUser", null) ||
    read("zenve_user", null) ||
    read("currentUser", null) ||
    read("user", null);

  if (!user || typeof user !== "object") {
    return null;
  }

  // Support profiles where the user object is nested.
  const profile =
    user.user && typeof user.user === "object" ? user.user : user;

  const id =
    profile.id ??
    profile.user_id ??
    profile.userId ??
    profile.pk;

  if (id == null) {
    return null;
  }

  return {
    id: String(id),
    name:
      profile.full_name ||
      profile.fullName ||
      profile.username ||
      profile.name ||
      profile.email ||
      "User",
    avatar:
      profile.profile_picture ||
      profile.profilePicture ||
      profile.profile_picture_url ||
      profile.profilePictureUrl ||
      profile.avatar_url ||
      profile.avatarUrl ||
      profile.avatar ||
      null,
  };
}

export function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getSocketUrl() {
  const url = new URL(API_BASE_URL, window.location.origin);
  const protocol = url.protocol === "https:" ? "wss:" : "ws:";

  return `${protocol}//${url.host}/ws/chat/`;
}

export function getThreadMeta(conversationId) {
  return getMeta(conversationId);
}

async function request(url, options = {}) {
  const token = getAccessToken();

  const headers = {
    Accept: "application/json",
    ...(options.body && !(options.body instanceof FormData)
      ? { "Content-Type": "application/json" }
      : {}),
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response;

  try {
    response = await fetch(url, {
      ...options,
      credentials: "include",
      headers,
    });
  } catch {
    throw new Error(
      "Cannot connect to the server. Check whether the Django backend is running."
    );
  }

  if (response.status === 204) {
    return null;
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      throw new Error(
        "Your session is not authorized. Please sign in again."
      );
    }

    throw new Error(
      data.detail ||
        data.message ||
        data.error ||
        `Messaging request failed (${response.status}).`
    );
  }

  return data;
}

function getOtherUser(conversation) {
  return (
    conversation.otherUser ||
    conversation.other_user ||
    conversation.other_participant ||
    conversation.doctor ||
    conversation.recipient ||
    {}
  );
}

function normalizeMessage(message, profileId) {
  const sender =
    message.sender && typeof message.sender === "object"
      ? message.sender.id ?? message.sender.user_id
      : message.sender;

  const senderId =
    sender ??
    message.sender_id ??
    message.senderId ??
    message.sender_user_id;

  const rawStatus = String(message.status || "").toLowerCase();

  return {
    id: message.id ?? message.uuid,
    from:
      senderId != null &&
      profileId != null &&
      String(senderId) === String(profileId)
        ? "me"
        : "them",
    text: message.body ?? message.text ?? message.content ?? "",
    status:
      rawStatus === "seen" || rawStatus === "read"
        ? "read"
        : rawStatus || "sent",
    createdAt:
      message.createdAt ??
      message.created_at ??
      message.timestamp ??
      null,
  };
}

export const normalizeIncomingMessage = normalizeMessage;

export async function getConversations() {
  const data = await request(ENDPOINTS.CONVERSATIONS);
  const profile = getProfile();

  return getRows(data).map((conversation) => {
    const other = getOtherUser(conversation);

    const conversationId = String(
      conversation.id ?? conversation.conversation_id
    );

    const lastMessage =
      conversation.lastMessage ||
      conversation.last_message ||
      conversation.latest_message ||
      null;

    const lastSender =
      lastMessage?.sender && typeof lastMessage.sender === "object"
        ? lastMessage.sender.id ?? lastMessage.sender.user_id
        : lastMessage?.sender ?? lastMessage?.sender_id;

    const storedMeta = getMeta(conversationId);

    return {
      id: conversationId,

      doctor: {
        id: String(other.id ?? other.user_id ?? ""),
        conversationId,
        name:
          other.fullName ||
          other.full_name ||
          other.username ||
          other.name ||
          "Doctor",
        specialty:
          other.specialty ||
          other.specialization ||
          "Veterinarian",
        city: other.city || "",
        state: other.state || "",
        avatar:
          other.profilePicture ||
          other.profile_picture ||
          other.avatarUrl ||
          other.avatar_url ||
          other.avatar ||
          null,
      },

      last: lastMessage
        ? {
            id: lastMessage.id,
            from:
              profile &&
              lastSender != null &&
              String(lastSender) === String(profile.id)
                ? "me"
                : "them",
            text:
              lastMessage.body ??
              lastMessage.text ??
              lastMessage.content ??
              "",
            createdAt:
              lastMessage.createdAt ||
              lastMessage.created_at ||
              lastMessage.timestamp ||
              null,
          }
        : null,

      meta: {
        ...storedMeta,
        unread:
          conversation.unreadCount ??
          conversation.unread_count ??
          conversation.unread_messages_count ??
          storedMeta.unread ??
          0,
      },
    };
  });
}

export async function getMessages(conversationId) {
  if (!conversationId) {
    throw new Error("A conversation ID is required to load messages.");
  }

  const data = await request(ENDPOINTS.MESSAGES(conversationId));
  const profile = getProfile();

  return getRows(data).map((message) =>
    normalizeMessage(message, profile?.id)
  );
}

export async function sendMessage(
  conversationId,
  { text, attachment } = {}
) {
  if (!conversationId) {
    throw new Error("A conversation ID is required to send a message.");
  }

  if (attachment) {
    throw new Error(
      "Attachments are not connected to the messaging API yet."
    );
  }

  const content = String(text ?? "").trim();

  if (!content) {
    throw new Error("Message cannot be empty.");
  }

  const data = await request(ENDPOINTS.MESSAGES(conversationId), {
    method: "POST",
    body: JSON.stringify({ body: content }),
  });

  const message = data?.data ?? data;
  const profile = getProfile();

  return normalizeMessage(
    {
      ...message,
      body: message?.body ?? message?.text ?? content,
      sender:
        message?.sender ??
        message?.sender_id ??
        profile?.id,
      status: message?.status ?? "sent",
    },
    profile?.id
  );
}

export async function setThreadMeta(conversationId, changes) {
  if (changes?.unread === 0) {
    await request(ENDPOINTS.READ(conversationId), {
      method: "POST",
    });
  }

  return patchMeta(conversationId, changes);
}

export async function deleteConversation(conversationId) {
  if (!conversationId) {
    throw new Error("A conversation ID is required.");
  }

  await request(`${API_BASE}/conversations/${conversationId}/`, {
    method: "DELETE",
  });

  const all = getMetaMap();
  delete all[String(conversationId)];
  write(META_KEY, all);
}

export async function getUnreadCount() {
  const data = await request(ENDPOINTS.UNREAD_COUNT);

  return (
    data?.count ??
    data?.unread_count ??
    data?.unreadCount ??
    data?.data?.count ??
    0
  );
}

export async function createCommunity({ title, participantIds }) {
  try {
    return await request(ENDPOINTS.CONVERSATIONS, {
      method: "POST",
      body: JSON.stringify({
        type: "GROUP",
        title,
        participant_ids: participantIds.map(Number),
      }),
    });
  } catch (error) {
    // Preserve the original API error if the fallback cannot be used.
    // Do not silently report a locally stored group as a server-created group.
    throw error;
  }
}

export const prepareAttachment = (file) =>
  new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error("No file selected."));
      return;
    }

    const isImage = file.type.startsWith("image/");
    const limit = isImage
      ? 1024 * 1024
      : 1536 * 1024;

    if (file.size > limit) {
      reject(
        new Error(
          `File too large. Limit is ${isImage ? "1 MB" : "1.5 MB"}.`
        )
      );
      return;
    }

    const reader = new FileReader();

    reader.onload = () =>
      resolve({
        type: isImage ? "image" : "file",
        name: file.name,
        size: file.size,
        mime: file.type,
        url: reader.result,
      });

    reader.onerror = () => {
      reject(new Error("Could not read the file."));
    };

    reader.readAsDataURL(file);
  });
