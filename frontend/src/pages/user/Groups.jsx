import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./Groups.css";
import JoinRequestsModal from "../../components/JoinRequestsModal.jsx";
import MembersModal from "../../components/MembersModal.jsx";
import CreateGroupModal from "../../components/CreateGroupModal.jsx";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  if (!token) {
    console.error("Authentication token not found.");
    return null;
  }
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`, 
  };
};

export default function Groups() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGroupId, setSelectedGroupId] = useState(""); 
  
  const [showRequestsModal, setShowRequestsModal] = useState(false); 
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);

  const [availableGroups, setAvailableGroups] = useState([]);
  const [joinedGroups, setJoinedGroups] = useState([]);
  const [myGroups, setMyGroups] = useState([]);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    const authHeaders = getAuthHeaders();
    if (!authHeaders) return;

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/group/all`, {
        method: "GET",
        headers: authHeaders,
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Server error fetching groups.");
        return;
      }

      const groups = data.groups;
      setAvailableGroups(groups);

      const rawUserEmail = localStorage.getItem("email");
      const currentUserEmail = rawUserEmail ? rawUserEmail.toLowerCase() : "";

      if (currentUserEmail === "") {
        console.error("CRITICAL ERROR: User email not found in localStorage. Cannot filter groups.");
        return; 
      }
      
      const joined = [];
      const owned = [];

      for (const g of groups) {
        const memRes = await fetch(`${import.meta.env.VITE_API_URL}/group/members/${g.group_id}`, {
          method: "GET",
          headers: authHeaders,
        });

        if (!memRes.ok) {
             const errorText = await memRes.text();
             console.error(`API Error fetching members for group ${g.group_id}: Status ${memRes.status}. Server response: ${errorText}`);
             continue;
        }

        let memData;
        try {
            memData = await memRes.json();
        } catch (jsonErr) {
            console.error(`JSON Parse Error fetching members for group ${g.group_id}. Server did not return valid JSON.`, jsonErr);
            continue;
        }

        const members = memData.members.map(m => m.member_email.toLowerCase());

        if (members.includes(currentUserEmail)) joined.push(g);
        
        if (g.owner_email && g.owner_email.toLowerCase() === currentUserEmail) owned.push(g);
      }

      setJoinedGroups(joined);
      setMyGroups(owned);

    } catch (err) {
      console.error("Failed to fetch groups or members:", err);
      alert("Network/Server error.");
    }
  };

  const handleSendJoinRequest = async (groupId) => {
    if (!groupId) {
      alert("Select a group first.");
      return;
    }
    
    const authHeaders = getAuthHeaders();
    if (!authHeaders) return;

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/group/join/request`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({ groupId: Number(groupId) })
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Join request failed.");
        return;
      }

      alert("Join request sent.");
      fetchGroups();
    } catch (err) {
      console.error("Failed to send join request:", err);
      alert("Server error.");
    }
  };

  const handleCreateGroup = () => {
    setShowCreateGroupModal(true);
  };

  const handleLeaveGroup = async (groupId) => {
    const authHeaders = getAuthHeaders();
    if (!authHeaders) return;

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/group/leave`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({ groupId })
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to leave group.");
        return;
      }

      alert("Left group.");
      fetchGroups();
    } catch (err) {
      console.error("Failed to leave group:", err);
      alert("Server error.");
    }
  };

  const normalizedSearchTerm = searchTerm.trim().toLowerCase();
  
  const filteredGroups = availableGroups.filter(group => {

    const isJoined = joinedGroups.some(g => g.group_id === group.group_id);
    const isOwned = myGroups.some(g => g.group_id === group.group_id);
    if (isJoined || isOwned) return false;

    return group.name.toLowerCase().includes(normalizedSearchTerm);
  });


  return (
    <div className="groups-container">
      <Link to="/home" className="groups-back">Back to Home</Link>
      
      <div className="groups-header">
        <h2>Groups</h2>
        <button type="button" className="primary-btn" onClick={handleCreateGroup}>
          + Create Group
        </button>
      </div>
      
      {/*RENDER CREATE GROUP MODAL */}
      {showCreateGroupModal && (
          <CreateGroupModal 
              onClose={() => setShowCreateGroupModal(false)}
              onGroupCreated={fetchGroups} 
          />
      )}

      <div className="groups-search-wrapper">
        <input
          type="text"
          placeholder="Search groups"
          className="groups-search"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      <h3 className="groups-section-title">Available Groups</h3>
      <div className="groups-box">
        {/*Conditional rendering based on whether a search term exists */}
        {normalizedSearchTerm === "" ? (
          <p>Start typing in the search bar to find available groups.</p>
        ) : filteredGroups.length === 0 ? (
          <p>No groups found matching "{searchTerm}".</p>
        ) : (
          <ul className="groups-list">
            {filteredGroups.map(g => (
              <li key={g.group_id} className="groups-list-item">
                <span>{g.name}</span>
                <button type="button" onClick={() => handleSendJoinRequest(g.group_id)}>
                  Join
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      
      {/* RENDER REQUESTS MODAL*/}
      {showRequestsModal && (
        <JoinRequestsModal 
          groupId={selectedGroupId} 
          onClose={() => setShowRequestsModal(false)} 
        />
      )}

      <h3 className="groups-section-title">Joined Groups</h3>
      <div className="groups-box">
        {joinedGroups.length === 0 ? (
          <p>No memberships yet.</p>
        ) : (
          <ul className="groups-list">
            {joinedGroups.map(g => (
              <li key={g.group_id} className="groups-list-item">
                <span>{g.name}</span>
                <button type="button" className="secondary-btn" onClick={() => handleLeaveGroup(g.group_id)}>
                  Leave
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <h3 className="groups-section-title">My Groups</h3>
      <div className="groups-box">
        {myGroups.length === 0 ? (
          <p>No owned groups.</p>
        ) : (
          <ul className="groups-list">
            {myGroups.map(g => (
              <li key={g.group_id} className="groups-list-item">
                <span>{g.name}</span>
                
                {/* BUTTON TO MANAGE MEMBERS */}
                <button 
                  type="button"
                  className="primary-btn"
                  onClick={() => {
                    setSelectedGroupId(g.group_id);
                    setShowMembersModal(true);
                  }}
                >
                  Manage Members
                </button>
                
                {/* BUTTON TO MANAGE JOIN REQUESTS */}
                <button 
                  type="button"
                  className="primary-btn" 
                  onClick={() => {
                    setSelectedGroupId(g.group_id);
                    setShowRequestsModal(true);
                  }}
                >
                  Manage Requests
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* RENDER MEMBERS MODAL */}
      {showMembersModal && (
        <MembersModal 
          groupId={selectedGroupId} 
          groupName={myGroups.find(g => g.group_id === selectedGroupId)?.name || 'Group'} 
          onClose={() => setShowMembersModal(false)}
          onMemberKicked={fetchGroups}
        />
      )}
    </div>
  );
}