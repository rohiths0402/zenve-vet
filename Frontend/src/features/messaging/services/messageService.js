
const API_BASE = "/api/messaging";

const ENDPOINTS = {
  CONVERSATIONS: `${API_BASE}/conversations/`,
  MESSAGES: (convId) => `${API_BASE}/conversations/${convId}/messages/`,
  READ: (convId) => `${API_BASE}/conversations/${convId}/read/`,
  UNREAD_COUNT: `${API_BASE}/messages/unread-count/`,
};

const PROFILE_KEY = "zenvet_profile";
const CONNECTIONS_KEY = "zenvet_connections";
const MESSAGES_KEY = "zenvet_messages";
const META_KEY = "zenvet_thread_meta";
const PRESENCE_KEY = "zenvet_presence";

export const DEFAULT_META = {
  starred: false,
  muted: false,
  archived: false,
  blocked: false,
  reported: false,
  unread: 0,
};

const read = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};
const write = (key, value) => localStorage.setItem(key, JSON.stringify(value));

const getHeaders = () => {
  const token = localStorage.getItem("token") || localStorage.getItem("zenve_token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const getProfile = () => read(PROFILE_KEY, null);
export const getPresence = () => read(PRESENCE_KEY, {});

const getMeta = (id) => ({
  ...DEFAULT_META,
  ...(read(META_KEY, {})[id] || {}),
});

const patchMeta = (id, changes) => {
  const all = read(META_KEY, {});
  all[id] = { ...DEFAULT_META, ...(all[id] || {}), ...changes };
  write(META_KEY, all);
  return all[id];
};

// 1. GET ALL CONVERSATIONS
export const getConversations = async () => {
  try {
    const res = await fetch(ENDPOINTS.CONVERSATIONS, { headers: getHeaders() });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const list = data.results || data;

    return list.map((c) => {
      const other = c.otherUser || {};
      const doctorId = String(other.id || c.id);
      const meta = { ...getMeta(doctorId), unread: c.unreadCount || 0 };

      return {
        id: c.id,
        doctor: {
          id: doctorId,
          conversationId: c.id,
          name: other.fullName || other.username || "Doctor",
          specialty: other.specialty || "Veterinarian",
          city: other.city || "",
          state: other.state || "",
          avatar: other.avatarUrl || null,
        },
        last: c.lastMessage
          ? {
              id: c.lastMessage.id,
              text: c.lastMessage.body, 
              createdAt: c.lastMessage.createdAt,
            }
          : null,
        meta,
      };
    });
  } catch (err) {
    const connections = read(CONNECTIONS_KEY, []);
    const all = read(MESSAGES_KEY, {});
    return connections.map((doctor) => {
      const thread = all[doctor.id] || [];
      return {
        doctor,
        last: thread[thread.length - 1] || null,
        meta: getMeta(doctor.id),
      };
    });
  }
};

// 2. GET MESSAGES FOR A CONVERSATION
export const getMessages = async (targetId) => {
  try {
    const res = await fetch(ENDPOINTS.MESSAGES(targetId), { headers: getHeaders() });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const rows = data.results || [];
    const myId = read(PROFILE_KEY, {})?.id;

    return rows.map((m) => ({
      id: m.id,
      from: String(m.sender) === String(myId) ? "me" : "them",
      text: m.body, 
      status: m.status === "seen" ? "read" : m.status, 
      createdAt: m.createdAt,
    }));
  } catch (err) {
    // Fallback
    const all = read(MESSAGES_KEY, {});
    return all[targetId] || [];
  }
};

// 3. SEND MESSAGE
export const sendMessage = async (targetId, { text, attachment }) => {
  try {
    const res = await fetch(ENDPOINTS.MESSAGES(targetId), {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({
        body: text, 
      }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const m = await res.json();

    return {
      id: m.id,
      from: "me",
      text: m.body,
      status: m.status === "seen" ? "read" : m.status,
      createdAt: m.createdAt,
    };
  } catch (err) {
    // Fallback to localStorage
    const all = read(MESSAGES_KEY, {});
    const message = {
      id: crypto.randomUUID(),
      from: "me",
      text: text || "",
      attachment: attachment || null,
      status: "sent",
      createdAt: new Date().toISOString(),
    };
    all[targetId] = [...(all[targetId] || []), message];
    write(MESSAGES_KEY, all);
    patchMeta(targetId, { archived: false });
    return message;
  }
};

// 4. MARK CONVERSATION AS READ
export const setThreadMeta = async (targetId, changes) => {
  if (changes.unread === 0) {
    try {
      await fetch(ENDPOINTS.READ(targetId), {
        method: "POST",
        headers: getHeaders(),
      });
    } catch {
      // ignore
    }
  }
  return patchMeta(targetId, changes);
};

// 5. DELETE CONVERSATION
export const deleteConversation = async (targetId) => {
  const all = read(MESSAGES_KEY, {});
  delete all[targetId];
  write(MESSAGES_KEY, all);
  patchMeta(targetId, {
    starred: false,
    muted: false,
    archived: false,
    unread: 0,
  });
};

// 6. ATTACHMENT PREPARATION
export const prepareAttachment = (file) =>
  new Promise((resolve, reject) => {
    const isImage = file.type.startsWith("image/");
    const limit = isImage ? 1024 * 1024 : 1536 * 1024;

    if (file.size > limit) {
      reject(new Error(`File too large. Limit is ${isImage ? "1 MB" : "1.5 MB"}`));
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
    reader.onerror = () => reject(new Error("Could not read the file."));
    reader.readAsDataURL(file);
  });