import { useState } from "react";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  if (!token) return null;
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`, 
  };
};

export default function KickConfirmationModal({ 
    groupId, 
    memberToKick, 
    groupName, 
    onClose, 
    onKickSuccess 
}) {
    const [loading, setLoading] = useState(false);
    const { account_id, member_email } = memberToKick;

    const handleConfirmKick = async () => {
        setLoading(true);
        const authHeaders = getAuthHeaders();
        if (!authHeaders) {
            setLoading(false);
            return;
        }
    
        try {
          const res = await fetch(`${import.meta.env.VITE_API_URL}/group/kick`, {
            method: "POST",
            headers: authHeaders,
            body: JSON.stringify({ groupId: Number(groupId), memberId: account_id })
          });
    
          const data = await res.json();
          if (!res.ok) {
            alert(data.error || "Kick failed.");
            return;
          }
    
          onKickSuccess();
          onClose();

        } catch (err) {
          console.error("Kick member error:", err);
          alert("Server error during kick attempt.");
        } finally {
          setLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content kick-confirm-modal">
                <h3>Confirm Kick</h3>
                {loading ? (
                    <p>Kicking {member_email}...</p>
                ) : (
                    <>
                        <p>Are you sure you want to kick <strong>{member_email}</strong> from <strong>{groupName}</strong>?</p>
                        
                        <div className="modal-actions">
                            <button type="button" onClick={onClose} disabled={loading}>
                                Cancel
                            </button>
                            <button 
                                type="button" 
                                onClick={handleConfirmKick} 
                                disabled={loading}
                                className="confirm-kick-btn"
                            >
                                Confirm Kick
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}