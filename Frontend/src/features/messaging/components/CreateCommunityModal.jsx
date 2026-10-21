import { useState } from "react";
import { Users, X, Check } from "lucide-react";

export default function CreateCommunityModal({
  onClose,
  onCreate,
  connections = [],
}) {
  const [title, setTitle] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [error, setError] = useState("");

  const toggleDoctor = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Please enter a community title.");
      return;
    }
    if (selectedIds.length === 0) {
      setError("Please select at least one doctor to add.");
      return;
    }

    const selectedDoctors = connections
      .filter((doc) => selectedIds.includes(String(doc.id)))
      .map((doc) => ({
        id: String(doc.id),
        name: doc.name,
        specialty: doc.specialty || "Veterinarian",
        city: doc.city || "",
        avatar: doc.avatar || null,
      }));

    if (onCreate) {
      onCreate({
        title: title.trim(),
        participantIds: selectedIds,
        selectedDoctors, 
      });
    }

    onClose();
  };

  return (
    <div className="msg-modal-overlay">
      <div className="msg-modal-card">
        <div className="msg-modal-head">
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Users size={20} color="#0b4a32" />
            <h3>Create New Community</h3>
          </div>
          <button type="button" className="msg-modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {error && <p className="msg-modal-error">{error}</p>}

          <div className="msg-modal-field">
            <label>Community Title</label>
            <input
              type="text"
              placeholder="e.g. SurgeryClub"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
            />
          </div>

          <div className="msg-modal-field">
            <label>Select Members ({selectedIds.length} selected)</label>
            <div className="msg-modal-doc-list">
              {connections.length === 0 ? (
                <p className="msg-hint">No connections found to add.</p>
              ) : (
                connections.map((doc) => {
                  const isChecked = selectedIds.includes(String(doc.id));
                  return (
                    <div
                      key={doc.id}
                      className={`msg-modal-doc-item ${isChecked ? "is-selected" : ""}`}
                      onClick={() => toggleDoctor(String(doc.id))}
                    >
                      <div className="msg-modal-doc-avatar">
                        {doc.name ? doc.name.charAt(0) : "D"}
                      </div>
                      <div style={{ flex: 1 }}>
                        <strong>{doc.name}</strong>
                        <small>{doc.specialty}</small>
                      </div>
                      <div
                        className={`msg-modal-checkbox ${isChecked ? "checked" : ""}`}
                      >
                        {isChecked && <Check size={14} color="#fff" />}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="msg-modal-actions">
            <button
              type="button"
              className="msg-btn-secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button type="submit" className="msg-btn-primary">
              Create Community
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
