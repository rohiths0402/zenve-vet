import { Fragment, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { FileText, LogOut, MessageCircle, UserPlus, Users } from "lucide-react";
import Avatar from "./Avatar";
import Composer from "./Composer";
import CommunityInvite from "./CommunityInvite";
import MessageText from "./MessageText";
import { formatDay, formatSize, formatTime, sameDay } from "../utils/format";
import "../community.css";

const getProfilePath = (member) => `/doctors/${member.id}`;

function Attachment({ item }) {
  if (item.type === "image") {
    return (
      <span className="msg-image">
        <img src={item.url} alt={item.name} />
      </span>
    );
  }

  return (
    <a href={item.url} download={item.name} className="msg-file">
      <FileText size={22} />
      <span>
        {item.name}
        <small>{formatSize(item.size)}</small>
      </span>
    </a>
  );
}

function MemberInfo({ member }) {
  return (
    <>
      <Avatar doctor={member} size={34} />
      <span>
        <strong>
          {member.name}
          {member.isYou ? " (You)" : ""}
        </strong>
        <small>
          {[member.specialty, member.city].filter(Boolean).join(" · ") ||
            "Veterinarian"}
        </small>
      </span>
    </>
  );
}

export default function CommunityChat({
  community,
  inviteLink,
  connections = [],
  onJoin,
  onLeave,
  onSend,
  onShare,
  onMessageMember,
  onNotice,
  onError,
}) {
  const [panel, setPanel] = useState(null);
  const endRef = useRef(null);

  const {
    name = "Community",
    members = [],
    memberCount = 0,
    joined = false,
    messages = [],
  } = community || {};

  useEffect(() => {
    if (joined) {
      endRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, joined]);

  function togglePanel(key) {
    setPanel((current) => (current === key ? null : key));
  }

  function handleLeave() {
    if (window.confirm("Leave the community?")) {
      setPanel(null);
      onLeave();
    }
  }

  const preview = members
    .slice(0, 3)
    .map((member) => member.name || "Doctor")
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
          {joined && (
            <button
              type="button"
              className={`msg-icon-btn ${panel === "invite" ? "is-on" : ""}`}
              title="Invite"
              onClick={() => togglePanel("invite")}
            >
              <UserPlus size={20} />
            </button>
          )}

          <button
            type="button"
            className={`msg-icon-btn ${panel === "members" ? "is-on" : ""}`}
            title="Members"
            onClick={() => togglePanel("members")}
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

      {panel === "members" && (
        <ul className="msg-community-members">
          {members.map((member, index) => (
            <li key={member.id ?? index}>
              {member.isYou ? (
                <div className="msg-member-main">
                  <MemberInfo member={member} />
                </div>
              ) : (
                <Link
                  to={getProfilePath(member)}
                  className="msg-member-main"
                  title="View profile"
                >
                  <MemberInfo member={member} />
                </Link>
              )}

              {!member.isYou && (
                <button
                  type="button"
                  className="msg-icon-btn"
                  title={`Message ${member.name}`}
                  onClick={() => onMessageMember(member)}
                >
                  <MessageCircle size={18} />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {panel === "invite" && joined && (
        <CommunityInvite
          link={inviteLink}
          connections={connections}
          onShare={onShare}
          onNotice={onNotice}
        />
      )}

      {joined ? (
        <>
          <div className="msg-body">
            {messages.length === 0 && (
              <p className="msg-community-empty">
                Welcome to {name}! Be the first to start the conversation.
              </p>
            )}

            {messages.map((message, index) => (
              <Fragment key={message.id ?? index}>
                {(index === 0 ||
                  !sameDay(
                    messages[index - 1]?.createdAt,
                    message.createdAt,
                  )) && (
                  <p className="msg-day">{formatDay(message.createdAt)}</p>
                )}

                {message.system ? (
                  <p className="msg-day">{message.text}</p>
                ) : (
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
                    {message.attachment && (
                      <Attachment item={message.attachment} />
                    )}
                    {message.text && (
                      <span>
                        <MessageText text={message.text} />
                      </span>
                    )}
                    <span className="msg-meta">
                      <time>{formatTime(message.createdAt)}</time>
                    </span>
                  </div>
                )}
              </Fragment>
            ))}

            <div ref={endRef} />
          </div>

          <Composer onSend={onSend} onError={onError} />
        </>
      ) : (
        <div className="msg-body">
          <div className="msg-community-join">
            <div className="msg-community-faces">
              {members.slice(0, 4).map((member, index) => (
                <Avatar key={member.id ?? index} doctor={member} size={40} />
              ))}
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
