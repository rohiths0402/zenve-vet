import { useRef, useState } from "react";
import Picker from "emoji-picker-react";
import { Smile } from "lucide-react";
import useDismiss from "../hooks/useDismiss";

export default function EmojiPicker({ onPick }) {
  const [open, setOpen] = useState(false);
  const boxRef = useRef(null);

  useDismiss(boxRef, open, () => setOpen(false));

  return (
    <div className="msg-emoji" ref={boxRef}>
      <button
        type="button"
        className="msg-icon-btn"
        title="Emoji"
        onClick={() => setOpen(!open)}
      >
        <Smile size={20} />
      </button>

      {open && (
        <div className="msg-emoji-popup">
          <Picker
            onEmojiClick={(data) => onPick(data.emoji)}
            width={320}
            height={360}
            previewConfig={{ showPreview: false }}
            skinTonesDisabled
          />
        </div>
      )}
    </div>
  );
}
