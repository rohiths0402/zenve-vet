export const formatTime = (iso) =>
  new Date(iso).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

export const formatStamp = (iso) => {
  const date = new Date(iso);
  if (date.toDateString() === new Date().toDateString()) return formatTime(iso);
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
};

export const formatDay = (iso) => {
  const date = new Date(iso);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
  return date.toLocaleDateString([], {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export const sameDay = (a, b) =>
  new Date(a).toDateString() === new Date(b).toDateString();

export const formatSize = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
};

export const initial = (name) =>
  name
    .replace(/^Dr\.?\s*/i, "")
    .trim()
    .charAt(0)
    .toUpperCase();
