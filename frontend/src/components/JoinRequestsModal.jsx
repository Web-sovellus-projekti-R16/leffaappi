import { useEffect, useState } from "react";
import "./JoinRequestsModal.css";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  if (!token) {
    console.error("Authentication token not found in localStorage.");
    return null;
  }
  return {
    "Content-Type": "application/json",
    // Attach the JWT in the authorization bearer header
    "Authorization": `Bearer ${token}`,
  };
};

export default function JoinRequestsModal({ groupId, onClose }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, [groupId]);

  const fetchRequests = async () => {
    const authHeaders = getAuthHeaders();
    if (!authHeaders) {
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/group/join/requests/${groupId}`, {
        method: "GET",
        headers: { "Authorization": authHeaders.Authorization } 
      });

      if (!res.ok) {
        // Use text() for robust error handling, as the response might not be JSON
        const errorText = await res.text();
        console.error(`API Error fetching requests (Status ${res.status}):`, errorText);
        alert("Failed to fetch requests. Check console for server response.");
        return;
      }

      const data = await res.json();
      setRequests(data.requests);

    } catch (err) {
      console.error("Failed to load requests", err);
      alert("Network or parsing error.");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId) => {
    const authHeaders = getAuthHeaders();
    if (!authHeaders) return;

    const res = await fetch(`${import.meta.env.VITE_API_URL}/group/join/approve`, {
      method: "POST",
      headers: authHeaders, 
      body: JSON.stringify({ requestId })
    });
    if (res.ok) fetchRequests();
  };

  const handleDeny = async (requestId) => {
    const authHeaders = getAuthHeaders();
    if (!authHeaders) return;

    const res = await fetch(`${import.meta.env.VITE_API_URL}/group/join/deny`, {
      method: "POST",
      headers: authHeaders, 
      body: JSON.stringify({ requestId })
    });
    if (res.ok) fetchRequests();
  };

  if (loading) return (
    <div className="modal-overlay">
      <div className="modal-content"><p>Loading...</p></div>
    </div>
  );

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Join Requests</h3>

        {requests.length === 0 ? (
          <p>No pending requests.</p>
        ) : (
          <ul>
            {requests.map(r => (
              <li key={r.request_id}> 
                <span>{r.requester_email || r.email}</span>
                <button onClick={() => handleApprove(r.request_id)}>Approve</button>
                <button onClick={() => handleDeny(r.request_id)}>Deny</button>
              </li>
            ))}
          </ul>
        )}

        <div className="modal-actions">
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}