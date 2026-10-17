import { Fragment, useEffect, useRef, useState } from "react";
import { LogOut, Users } from "lucide-react";
import Avatar from "./Avatar";
import Composer from "./Composer";
import { formatDay, formatTime, sameDay } from "../utils/format";
import "../community.css";

export default function CommunityChat({
  community,
  onJoin,
  onLeave,
  onSend,
  onError,
}) {
  const [showMembers, setShowMembers] = useState(false);
  const endRef = useRef(null);

  const {
    name = "Community",
    members = [],
    memberCount = 1,
    joined = true,
    messages = [],
  } = community || {};

  useEffect(() => {
    if (joined) {
      endRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, joined]);

  function handleLeave() {
    if (window.confirm("Leave the community?")) {
      setShowMembers(false);
      if (onLeave) onLeave();
    }
  }

  const safeMembers = Array.isArray(members) ? members : [];
  const preview = safeMembers
    .slice(0, 3)
    .map((member) =>
      typeof member === "string" ? member : member?.name || "Doctor",
    )
    .join(", ");

  return (
    <section className="msg-chat">
      <header className="msg-chat-head">
        <div className="msg-community-title">
          <span className="msg-community-icon">
            <Users size={22} />
          </span>

          <div className="msg-community-who">
            <strong>{name}</strong>
            <small>
              {memberCount} doctors {preview ? `· ${preview}` : ""}
            </small>
          </div>
        </div>

        <div className="msg-chat-actions">
          <button
            type="button"
            className={`msg-icon-btn ${showMembers ? "is-on" : ""}`}
            title="Members"
            onClick={() => setShowMembers((previous) => !previous)}
          >
            <Users size={20} />
          </button>

          {joined && (
            <button
              type="button"
              className="msg-icon-btn"
              title="Leave community"
              onClick={handleLeave}
            >
              <LogOut size={20} />
            </button>
          )}
        </div>
      </header>

      {showMembers && (
        <ul className="msg-community-members">
          {safeMembers.map((member, idx) => {
            const doc =
              typeof member === "string" ? { id: idx, name: member } : member;
            return (
              <li key={doc.id ?? idx}>
                <Avatar doctor={doc} size={34} />
                <span>
                  <strong>
                    {doc.name}
                    {doc.isYou ? " (You)" : ""}
                  </strong>
                  <small>
                    {[doc.specialty, doc.city].filter(Boolean).join(" · ") ||
                      "Veterinarian"}
                  </small>
                </span>
              </li>
            );
          })}
        </ul>
      )}

      {joined ? (
        <>
          <div className="msg-body">
            {messages.length === 0 ? (
              <p
                className="msg-note"
                style={{ margin: "auto", color: "#6b6b64" }}
              >
                Welcome to {name}! Be the first to start the conversation.
              </p>
            ) : (
              messages.map((message, index) => (
                <Fragment key={message.id ?? index}>
                  {(index === 0 ||
                    !sameDay(
                      messages[index - 1]?.createdAt,
                      message.createdAt,
                    )) && (
                    <p className="msg-day">{formatDay(message.createdAt)}</p>
                  )}

                  <div
                    className={`msg-bubble ${
                      message.from === "me" ? "is-me" : "is-them"
                    }`}
                  >
                    {message.from === "them" && (
                      <strong className="msg-sender">
                        {message.senderName}
                      </strong>
                    )}
                    <span>{message.text}</span>
                    <span className="msg-meta">
                      <time>{formatTime(message.createdAt)}</time>
                    </span>
                  </div>
                </Fragment>
              ))
            )}

            <p className="msg-note">
              Community conversation. Messages stay in this browser.
            </p>

            <div ref={endRef} />
          </div>

          <Composer onSend={onSend} onError={onError} />
        </>
      ) : (
        <div className="msg-body">
          <div className="msg-community-join">
            <div className="msg-community-faces">
              {safeMembers.slice(0, 4).map((member, idx) => {
                const doc =
                  typeof member === "string"
                    ? { id: idx, name: member }
                    : member;
                return <Avatar key={doc.id ?? idx} doctor={doc} size={40} />;
              })}
            </div>

            <h3>{name}</h3>

            <p>
              {memberCount} veterinary doctors are already part of this
              community. Meet your peers and share your practice.
            </p>

            <button type="button" className="msg-cta" onClick={onJoin}>
              Join community
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
