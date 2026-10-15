import { useRef, useState } from "react";
import { FileText, Image as ImageIcon, Paperclip, X } from "lucide-react";
import EmojiPicker from "./EmojiPicker";
import { prepareAttachment } from "../services/messageService";
import { formatSize } from "../utils/format";

export default function Composer({ onSend, onError }) {
  const [text, setText] = useState("");
  const [attachment, setAttachment] = useState(null);
  const textRef = useRef(null);
  const imageInput = useRef(null);
  const fileInput = useRef(null);

  const canSend = text.trim() !== "" || attachment !== null;

  async function handleFile(e) {
    const file = e.target.files[0];
    e.target.value = "";
    if (!file) return;

    try {
      const data = await prepareAttachment(file);
      setAttachment(data);
    } catch (err) {
      onError(err.message);
    }
  }

  function addEmoji(emoji) {
    const box = textRef.current;
    const start = box.selectionStart;
    const end = box.selectionEnd;
    setText(text.slice(0, start) + emoji + text.slice(end));

    setTimeout(() => {
      box.focus();
      box.setSelectionRange(start + emoji.length, start + emoji.length);
    }, 0);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!canSend) return;

    const sent = await onSend({ text, attachment });
    if (sent) {
      setText("");
      setAttachment(null);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      handleSubmit(e);
    }
  }

  return (
    <form className="msg-composer" onSubmit={handleSubmit}>
      {attachment && (
        <div className="msg-pending">
          {attachment.type === "image" ? (
            <img src={attachment.url} alt="" />
          ) : (
            <FileText size={28} />
          )}
          <span className="msg-pending-name">
            {attachment.name}
            <small>{formatSize(attachment.size)}</small>
          </span>
          <button
            type="button"
            title="Remove"
            onClick={() => setAttachment(null)}
          >
            <X size={18} />
          </button>
        </div>
      )}

      <textarea
        ref={textRef}
        placeholder="Write a message..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
      />

      <div className="msg-tools">
        <div className="msg-tools-left">
          <button
            type="button"
            className="msg-icon-btn"
            title="Photo"
            onClick={() => imageInput.current.click()}
          >
            <ImageIcon size={20} />
          </button>
          <button
            type="button"
            className="msg-icon-btn"
            title="Attach file"
            onClick={() => fileInput.current.click()}
          >
            <Paperclip size={20} />
          </button>
          <EmojiPicker onPick={addEmoji} />
        </div>

        <button type="submit" className="msg-send" disabled={!canSend}>
          Send
        </button>
      </div>

      <input
        ref={imageInput}
        type="file"
        accept="image/*"
        hidden
        onChange={handleFile}
      />
      <input
        ref={fileInput}
        type="file"
        accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.zip"
        hidden
        onChange={handleFile}
      />
    </form>
  );
}
