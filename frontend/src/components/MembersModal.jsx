import { useEffect, useState } from "react";


const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  if (!token) return null;
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`, 
  };
};

const currentUserId = Number(localStorage.getItem("userId"));

export default function MembersModal({ groupId, onClose, groupName, onMemberKicked }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMembers();
  }, [groupId]);

  const fetchMembers = async () => {
    setLoading(true);
    const authHeaders = getAuthHeaders();
    if (!authHeaders) {
        setLoading(false);
        return;
    }

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/group/members/${groupId}`, {
        method: "GET",
        headers: { "Authorization": authHeaders.Authorization } 
      });

      if (!res.ok) {
        console.error("Failed to fetch members:", await res.text());
        return;
      }

      const data = await res.json();
      setMembers(data.members); 

    } catch (err) {
      console.error("Network error fetching members:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleKick = async (memberAccountId, memberEmail) => {
    if (window.confirm(`Are you sure you want to kick ${memberEmail} from ${groupName}?`)) {
      const authHeaders = getAuthHeaders();
      if (!authHeaders) return;

      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/group/kick`, {
          method: "POST",
          headers: authHeaders,
          body: JSON.stringify({ groupId: Number(groupId), memberId: memberAccountId })
        });

        if (!res.ok) {
          const error = await res.json();
          alert(error.error || "Failed to kick member.");
          return;
        }

        alert("Member kicked.");
        fetchMembers();
        onMemberKicked();

      } catch (err) {
        console.error("Kick member error:", err);
        alert("Server error during kick attempt.");
      }
    }
  };

  if (loading) return (
    <div className="modal-overlay">
      <div className="modal-content">
        <p>Loading members...</p>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );

  return (
    <div className="modal-overlay">
      <div className="modal-content members-modal">
        <h3>Members of {groupName}</h3>

        {members.length === 0 ? (
          <p>No members found.</p>
        ) : (
          <ul className="members-list">
            {members.map(m => {
              const canKick = m.account_id !== currentUserId; 
              
              return (
                <li key={m.account_id}> 
                  <span>{m.member_email}</span>
                  
                  {/* Show kick button only if the member is NOT the current user */}
                  {canKick && (
                      <button 
                          onClick={() => handleKick(m.account_id, m.member_email)}
                          className="kick-button" 
                      >
                        Kick
                      </button>
                  )}
                </li>
              );
            })}
          </ul>
        )}

        <div className="modal-actions">
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}