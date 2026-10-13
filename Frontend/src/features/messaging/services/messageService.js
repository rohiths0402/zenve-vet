const PROFILE_KEY = "zenvet_profile";
const CONNECTIONS_KEY = "zenvet_connections";
const MESSAGES_KEY = "zenvet_messages";
const META_KEY = "zenvet_thread_meta";
const PRESENCE_KEY = "zenvet_presence";

const MAX_IMAGE = 1024 * 1024;
const MAX_FILE = 1536 * 1024;

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

const write = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

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

export const getProfile = () => read(PROFILE_KEY, null);

export const getPresence = () => read(PRESENCE_KEY, {});

export const getConversations = async () => {
  const connections = read(CONNECTIONS_KEY, []);
  const all = read(MESSAGES_KEY, {});

  return connections
    .map((doctor) => {
      const thread = all[doctor.id] || [];
      return {
        doctor,
        last: thread[thread.length - 1] || null,
        meta: getMeta(doctor.id),
      };
    })
    .sort((a, b) => {
      const at = a.last ? new Date(a.last.createdAt).getTime() : 0;
      const bt = b.last ? new Date(b.last.createdAt).getTime() : 0;
      if (at !== bt) return bt - at;
      return a.doctor.name.localeCompare(b.doctor.name);
    });
};

export const getMessages = async (doctorId) => {
  const all = read(MESSAGES_KEY, {});
  return all[doctorId] || [];
};

export const sendMessage = async (doctorId, { text, attachment }) => {
  const all = read(MESSAGES_KEY, {});
  const message = {
    id: crypto.randomUUID(),
    from: "me",
    text: text || "",
    attachment: attachment || null,
    status: "sent",
    createdAt: new Date().toISOString(),
  };
  all[doctorId] = [...(all[doctorId] || []), message];
  write(MESSAGES_KEY, all);
  patchMeta(doctorId, { archived: false });
  return message;
};

export const setThreadMeta = async (doctorId, changes) =>
  patchMeta(doctorId, changes);

export const deleteConversation = async (doctorId) => {
  const all = read(MESSAGES_KEY, {});
  delete all[doctorId];
  write(MESSAGES_KEY, all);
  patchMeta(doctorId, {
    starred: false,
    muted: false,
    archived: false,
    unread: 0,
  });
};

export const prepareAttachment = (file) =>
  new Promise((resolve, reject) => {
    const isImage = file.type.startsWith("image/");
    const limit = isImage ? MAX_IMAGE : MAX_FILE;

    if (file.size > limit) {
      reject(
        new Error(
          `File is too large. Limit is ${isImage ? "1 MB" : "1.5 MB"} for now.`,
        ),
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
    reader.onerror = () => reject(new Error("Could not read the file."));
    reader.readAsDataURL(file);
  });
