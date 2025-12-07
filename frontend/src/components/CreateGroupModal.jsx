import { useState } from "react";
import "./CreateGroupModal.css"; 

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  if (!token) return null;
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`, 
  };
};

export default function CreateGroupModal({ onClose, onGroupCreated }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("Group name is required.");
      return;
    }

    setLoading(true);
    const authHeaders = getAuthHeaders();
    if (!authHeaders) {
        setLoading(false);
        return;
    }

    const ownerEmail = localStorage.getItem("email");
    if (!ownerEmail) {
        alert("CRITICAL: Owner email not found in session. Please re-login.");
        setLoading(false);
        return;
    }

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/group/create`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({ name: name.trim(), description: description.trim(), ownerEmail })
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Creation failed.");
        return;
      }

      setSuccessMessage("Group created successfully! Closing...");
      onGroupCreated(); 

      setTimeout(() => {
          onClose();
      }, 1500);

    } catch (err) {
      console.error("Failed to create group:", err);
      alert("Server error during group creation.");
    } finally {
      if (!successMessage) {
        setLoading(false);
      }
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content create-group-modal">
        <h3>Create New Group</h3>
        
        {successMessage ? (
            <p className="success-message">{successMessage}</p>
        ) : (
            <form onSubmit={handleSubmit}>
              
              <div className="form-group">
                <label htmlFor="name">Group Name</label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Description (Optional)</label>
                <textarea
                  id="description"
                  rows="3"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="modal-actions">
                <button type="button" onClick={onClose} disabled={loading}>
                  Cancel
                </button>
                <button type="submit" disabled={loading}>
                  {loading ? 'Creating...' : 'Create Group'}
                </button>
              </div>
            </form>
        )}
      </div>
    </div>
  );
}