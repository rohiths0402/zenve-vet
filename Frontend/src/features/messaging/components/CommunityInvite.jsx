import { useState } from "react";
import { Check, Copy, Send } from "lucide-react";
import Avatar from "./Avatar";

export default function CommunityInvite({
  link,
  connections,
  onShare,
  onNotice,
}) {
  const [sent, setSent] = useState([]);
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      onNotice("Invite link copied.");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      onNotice("Could not copy. Select the link and copy it manually.");
    }
  }

  async function sendTo(doctor) {
    if (await onShare(doctor)) {
      setSent((previous) => [...previous, String(doctor.id)]);
    }
  }

  return (
    <div className="msg-community-invite">
      <p className="msg-invite-title">Invite link</p>

      <div className="msg-invite-link">
        <input
          type="text"
          readOnly
          value={link}
          onFocus={(event) => event.target.select()}
        />
        <button type="button" className="msg-invite-copy" onClick={copyLink}>
          {copied ? <Check size={15} /> : <Copy size={15} />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>

      <p className="msg-invite-title">Send to a connection</p>

      {connections.length === 0 ? (
        <p className="msg-hint">
          No connections yet. Copy the link and share it anywhere.
        </p>
      ) : (
        <ul className="msg-invite-list">
          {connections.map((doctor) => {
            const isSent = sent.includes(String(doctor.id));

            return (
              <li key={doctor.id}>
                <Avatar doctor={doctor} size={34} />
                <span>
                  <strong>{doctor.name}</strong>
                  <small>{doctor.specialty}</small>
                </span>
                <button
                  type="button"
                  className="msg-invite-send"
                  disabled={isSent}
                  onClick={() => sendTo(doctor)}
                >
                  <Send size={14} />
                  {isSent ? "Sent" : "Send"}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
