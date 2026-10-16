import { useRef, useState } from "react";
import { Ellipsis } from "lucide-react";
import useDismiss from "../hooks/useDismiss";

export default function ChatMenu({ meta, onAction }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useDismiss(menuRef, open, () => setOpen(false));

  const options = [
    { key: "unread", label: "Mark as unread" },
    { key: "star", label: meta.starred ? "Remove star" : "Star" },
    { key: "mute", label: meta.muted ? "Unmute" : "Mute" },
    { key: "archive", label: meta.archived ? "Unarchive" : "Archive" },
    { key: "report", label: "Report" },
    { key: "block", label: meta.blocked ? "Unblock" : "Block" },
    { key: "delete", label: "Delete conversation", danger: true },
  ];

  function choose(key) {
    setOpen(false);
    onAction(key);
  }

  return (
    <div className="msg-menu" ref={menuRef}>
      <button
        type="button"
        className="msg-icon-btn"
        title="More"
        onClick={() => setOpen(!open)}
      >
        <Ellipsis size={20} />
      </button>

      {open && (
        <ul className="msg-menu-list">
          {options.map((item) => (
            <li key={item.key}>
              <button
                type="button"
                className={item.danger ? "is-danger" : ""}
                onClick={() => choose(item.key)}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
