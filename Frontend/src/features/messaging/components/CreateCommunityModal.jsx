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
  const [loading, setLoading] = useState(false);

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

    try {
      const defaultList = [
        {
          id: "1",
          name: "Zenve Vet Community",
          memberCount: 11,
          messages: [
            {
              id: "m1",
              from: "them",
              senderName: "Dr. Vikram Singh",
              text: "Sharing some equine rehab notes...",
              createdAt: new Date().toISOString(),
            },
          ],
        },
      ];

      const existingCommunities =
        JSON.parse(localStorage.getItem("zenvet_communities")) || defaultList;

      const newCommunity = {
        id: "community_" + Date.now(),
        name: title.trim(),
        memberCount: selectedIds.length + 1,
        messages: [
          {
            id: "m_welcome",
            from: "me",
            senderName: "You",
            text: `Welcome to ${title.trim()}! Group created.`,
            createdAt: new Date().toISOString(),
          },
        ],
      };

      const updatedList = [newCommunity, ...existingCommunities];
      localStorage.setItem("zenvet_communities", JSON.stringify(updatedList));

      onClose();
      window.location.reload(); 
    } catch (err) {
      setError("Failed to create community.");
    }
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
              placeholder="e.g. Small Animal Surgeons TN"
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
                  const isChecked = selectedIds.includes(doc.id);
                  return (
                    <div
                      key={doc.id}
                      className={`msg-modal-doc-item ${isChecked ? "is-selected" : ""}`}
                      onClick={() => toggleDoctor(doc.id)}
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
            <button
              type="submit"
              className="msg-btn-primary"
              disabled={loading}
            >
              {loading ? "Creating..." : "Create Community"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
