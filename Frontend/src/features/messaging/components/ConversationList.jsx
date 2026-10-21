import { useState } from "react";
import { Archive, Ban, BellOff, Search, Star, Users } from "lucide-react";
import Avatar from "./Avatar";
import { formatStamp } from "../utils/format";
import CreateCommunityModal from "./CreateCommunityModal";

const TABS = [
  { key: "all", label: "All" },
  { key: "unread", label: "Unread" },
  { key: "connections", label: "Connections" },
  { key: "community", label: "Community" },
  { key: "starred", label: "Starred" },
  { key: "archived", label: "Archived" },
];

const EMPTY_TEXT = {
  all: "No conversations yet. Open the Connections tab to start one.",
  unread: "No unread messages.",
  starred: "No starred conversations.",
  archived: "No archived conversations.",
  connections: "Connect with doctors from the Vet network to start chatting.",
  community: "No communities found.",
};

function getPreview(last, doctor) {
  if (!last) return doctor.specialty;
  const prefix = last.from === "me" ? "You: " : "";
  if (last.text) return prefix + last.text;
  if (last.attachment?.type === "image") return prefix + "Sent a photo";
  return prefix + "Sent a file";
}

function getCommunityPreview(comm) {
  if (!comm) return "";
  const last = comm.messages?.[comm.messages.length - 1];
  const count = `${comm.memberCount || 1} doctors`;
  if (!last) return count;
  const sender = last.from === "me" ? "You" : last.senderName || "Doctor";
  return `${count} · ${sender}: ${last.text}`;
}

export default function ConversationList({
  items,
  presence,
  community,
  communities = [],
  activeCommunityId,
  communityActive,
  onOpenCommunity,
  onCommunityCreate,
  activeId,
  query,
  onQuery,
  onSelect,
  filter,
  onFilter,
  unreadCount,
}) {
  const [showModal, setShowModal] = useState(false);

  const communitiesList =
    communities.length > 0 ? communities : community ? [community] : [];

  const emptyText = query.trim()
    ? "No results match your search."
    : EMPTY_TEXT[filter] || "No conversations found.";

  return (
    <aside className="msg-side">
      <h1 className="msg-title">Messages</h1>

      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
        <label className="msg-search" style={{ flex: 1, margin: 0 }}>
          <Search size={16} />
          <input
            type="text"
            placeholder="Search messages"
            value={query}
            onChange={(e) => onQuery(e.target.value)}
          />
        </label>
        <button
          type="button"
          className="msg-add-community-btn"
          title="Create New Community"
          onClick={() => setShowModal(true)}
        >
          <Users size={16} />
          <span>+</span>
        </button>
      </div>

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
        {filter === "community" ? (
          communitiesList.map((comm) => {
            const lastMsg = comm.messages?.[comm.messages.length - 1];
            const isThisActive =
              communityActive &&
              String(activeCommunityId || "1") === String(comm.id);

            return (
              <button
                key={comm.id}
                type="button"
                className={`msg-item ${isThisActive ? "is-active" : ""}`}
                style={{ marginBottom: "6px" }}
                onClick={() => onOpenCommunity(comm.id)}
              >
                <span
                  className="msg-avatar msg-avatar-text"
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: "12px",
                    background: "#e4ebe5",
                    color: "#0b4a32",
                  }}
                >
                  <Users size={20} />
                </span>

                <span className="msg-item-text">
                  <span className="msg-item-top">
                    <strong>{comm.name}</strong>
                    {lastMsg && <time>{formatStamp(lastMsg.createdAt)}</time>}
                  </span>
                  <small>{getCommunityPreview(comm)}</small>
                </span>
              </button>
            );
          })
        ) : (
          <>
            {items.map(({ id, doctor, last, meta }) => {
              const live = presence[doctor.id] || {};
              const isActive =
                String(id) === String(activeId) && !communityActive;

              return (
                <button
                  key={id}
                  type="button"
                  className={`msg-item ${isActive ? "is-active" : ""} ${meta.unread > 0 ? "is-unread" : ""}`}
                  onClick={() => onSelect(id)}
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
          </>
        )}
      </div>

      {showModal && (
        <CreateCommunityModal
          onClose={() => setShowModal(false)}
          connections={items.map((i) => i.doctor)}
          onCreate={async (data) => {
            if (onCommunityCreate) {
              await onCommunityCreate(data);
            }
            setShowModal(false);
          }}
        />
      )}
    </aside>
  );
}
