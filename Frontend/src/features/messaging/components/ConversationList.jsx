import { Archive, Ban, BellOff, Search, Star } from "lucide-react";
import Avatar from "./Avatar";
import { formatStamp } from "../utils/format";

const TABS = [
  { key: "all", label: "All" },
  { key: "unread", label: "Unread" },
  { key: "connections", label: "Connections" },
  { key: "starred", label: "Starred" },
  { key: "archived", label: "Archived" },
];

const EMPTY_TEXT = {
  all: "No conversations yet. Open the Connections tab to start one.",
  unread: "No unread messages.",
  starred: "No starred conversations.",
  archived: "No archived conversations.",
  connections: "Connect with doctors from the Vet network to start chatting.",
};

function getPreview(last, doctor) {
  if (!last) return doctor.specialty;

  const prefix = last.from === "me" ? "You: " : "";
  if (last.text) return prefix + last.text;
  if (last.attachment?.type === "image") return prefix + "Sent a photo";
  return prefix + "Sent a file";
}

export default function ConversationList({
  items,
  presence,
  activeId,
  query,
  onQuery,
  onSelect,
  filter,
  onFilter,
  unreadCount,
}) {
  const emptyText = query.trim()
    ? "No doctors match your search."
    : EMPTY_TEXT[filter];

  return (
    <aside className="msg-side">
      <h1 className="msg-title">Messages</h1>

      <label className="msg-search">
        <Search size={16} />
        <input
          type="text"
          placeholder="Search messages"
          value={query}
          onChange={(e) => onQuery(e.target.value)}
        />
      </label>

      <div className="msg-tabs">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={`msg-tab ${filter === tab.key ? "is-on" : ""}`}
            onClick={() => onFilter(tab.key)}
          >
            {tab.label}
            {tab.key === "unread" && unreadCount > 0 && (
              <span className="msg-tab-count">{unreadCount}</span>
            )}
          </button>
        ))}
      </div>

      <div className="msg-list">
        {items.map(({ doctor, last, meta }) => {
          const live = presence[doctor.id] || {};

          return (
            <button
              key={doctor.id}
              type="button"
              className={`msg-item ${doctor.id === activeId ? "is-active" : ""} ${meta.unread > 0 ? "is-unread" : ""}`}
              onClick={() => onSelect(doctor.id)}
            >
              <Avatar
                doctor={doctor}
                size={44}
                online={live.online || live.typing}
              />

              <span className="msg-item-text">
                <span className="msg-item-top">
                  <strong>{doctor.name}</strong>
                  {last && <time>{formatStamp(last.createdAt)}</time>}
                </span>
                {live.typing ? (
                  <small className="msg-typing-text">typing...</small>
                ) : (
                  <small>{getPreview(last, doctor)}</small>
                )}
              </span>

              <span className="msg-item-flags">
                {meta.starred && <Star size={14} fill="currentColor" />}
                {meta.muted && <BellOff size={14} />}
                {meta.archived && <Archive size={14} />}
                {meta.blocked && <Ban size={14} />}
                {meta.unread > 0 && (
                  <span className="msg-badge">{meta.unread}</span>
                )}
              </span>
            </button>
          );
        })}

        {items.length === 0 && <p className="msg-hint">{emptyText}</p>}
      </div>
    </aside>
  );
}
