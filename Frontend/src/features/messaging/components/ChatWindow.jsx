import { Fragment, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Check, CheckCheck, FileText, MessageCircle, Star } from "lucide-react";
import Avatar from "./Avatar";
import ChatMenu from "./ChatMenu";
import Composer from "./Composer";
import MessageText from "./MessageText";
import { formatDay, formatSize, formatTime, sameDay } from "../utils/format";

const getProfilePath = (doctor) => `/doctors/${doctor.id}`;

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

function Ticks({ status }) {
  if (status === "read")
    return <CheckCheck size={15} className="msg-tick is-read" />;
  if (status === "delivered")
    return <CheckCheck size={15} className="msg-tick" />;
  return <Check size={15} className="msg-tick" />;
}

function getPresenceText(live) {
  if (live.typing) return "typing...";
  if (live.online) return "Online";
  if (live.lastSeen) return `Last seen ${formatTime(live.lastSeen)}`;
  return "Offline";
}

function Welcome({ doctor, canSend, onSend }) {
  const place = [doctor.city, doctor.state].filter(Boolean).join(", ");

  function sayHello() {
    onSend({
      text: `Hello ${doctor.name}, nice to connect with you!`,
      attachment: null,
    });
  }

  return (
    <div className="msg-welcome">
      <Link to={getProfilePath(doctor)}>
        <Avatar doctor={doctor} size={72} />
        <h3>{doctor.name}</h3>
      </Link>
      <small>
        {doctor.specialty}
        {place && ` · ${place}`}
      </small>
      <p>Say hello to {doctor.name}.</p>
      {canSend && (
        <button type="button" className="msg-cta" onClick={sayHello}>
           Say hello
        </button>
      )}
    </div>
  );
}

export default function ChatWindow({
  doctor,
  meta,
  live,
  messages,
  onSend,
  onError,
  onAction,
}) {
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, doctor, live.typing]);

  if (!doctor) {
    return (
      <section className="msg-chat msg-chat-empty">
        <MessageCircle size={28} strokeWidth={1.5} />
        <h2>Select a conversation</h2>
      </section>
    );
  }

  const isLive = live.online || live.typing;

  return (
    <section className="msg-chat">
      <header className="msg-chat-head">
        <Link
          to={getProfilePath(doctor)}
          className="msg-chat-profile"
          title="View profile"
        >
          <Avatar doctor={doctor} online={isLive} />
          <div className="msg-chat-who">
            <strong>{doctor.name}</strong>
            <small>
              {doctor.specialty}
              {doctor.city && ` · ${doctor.city}`}
              {doctor.state && `, ${doctor.state}`}
            </small>
            <small className={`msg-online-text ${isLive ? "" : "is-offline"}`}>
              {getPresenceText(live)}
            </small>
          </div>
        </Link>

        <div className="msg-chat-actions">
          <ChatMenu meta={meta} onAction={onAction} />
          <button
            type="button"
            className={`msg-icon-btn ${meta.starred ? "is-on" : ""}`}
            title={meta.starred ? "Remove star" : "Star"}
            onClick={() => onAction("star")}
          >
            <Star size={20} fill={meta.starred ? "currentColor" : "none"} />
          </button>
        </div>
      </header>

      <div className="msg-body">
        {messages.length === 0 && (
          <Welcome doctor={doctor} canSend={!meta.blocked} onSend={onSend} />
        )}

        {messages.map((m, i) => (
          <Fragment key={m.id}>
            {(i === 0 || !sameDay(messages[i - 1].createdAt, m.createdAt)) && (
              <p className="msg-day">{formatDay(m.createdAt)}</p>
            )}
            <div
              className={`msg-bubble ${m.from === "me" ? "is-me" : "is-them"}`}
            >
              {m.attachment && <Attachment item={m.attachment} />}
              {m.text && (
                <span>
                  <MessageText text={m.text} />
                </span>
              )}
              <span className="msg-meta">
                <time>{formatTime(m.createdAt)}</time>
                {m.from === "me" && <Ticks status={m.status} />}
              </span>
            </div>
          </Fragment>
        ))}

        {live.typing && (
          <div className="msg-bubble is-them msg-typing">
            <i />
            <i />
            <i />
          </div>
        )}

        <div ref={endRef} />
      </div>

      {meta.blocked ? (
        <div className="msg-blocked">
          <span>You blocked this doctor. Unblock to send messages.</span>
          <button type="button" onClick={() => onAction("block")}>
            Unblock
          </button>
        </div>
      ) : (
        <Composer key={doctor.id} onSend={onSend} onError={onError} />
      )}
    </section>
  );
}
