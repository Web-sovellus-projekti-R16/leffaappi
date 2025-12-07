import { useEffect, useState } from "react";
import KickConfirmationModal from "./KickConfirmationModal.jsx";

const currentUserId = Number(localStorage.getItem("id")); 

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  if (!token) return null;
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`, 
  };
};


export default function MembersModal({ groupId, onClose, groupName, onMemberKicked }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [memberToKick, setMemberToKick] = useState(null); 

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

  const handleKick = (member) => {
      setMemberToKick(member);
  };
  
  const handleKickSuccess = () => {
      setMemberToKick(null); 
      fetchMembers(); 
      onMemberKicked(); 
  }

  if (loading) return (
    <div className="modal-overlay">
      <div className="modal-content">
        <p>Loading members...</p>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
  
  if (memberToKick) {
      return (
          <KickConfirmationModal
              groupId={groupId}
              memberToKick={memberToKick}
              groupName={groupName}
              onClose={() => setMemberToKick(null)}
              onKickSuccess={handleKickSuccess}
          />
      );
  }

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
                  
                  {canKick && (
                      <button 
                          onClick={() => handleKick(m)}
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