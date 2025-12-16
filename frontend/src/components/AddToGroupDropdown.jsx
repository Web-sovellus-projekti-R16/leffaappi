import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./AddToGroupDropdown.css";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  if (!token) return null;

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

export default function AddToGroupDropdown({ movieId, movieTitle }) {
  const [groups, setGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const rawUserEmail = localStorage.getItem("email");
  const currentUserEmail = rawUserEmail ? rawUserEmail.toLowerCase() : "";

  useEffect(() => {
    if (currentUserEmail) {
      fetchUserGroups();
    } else {
      setIsLoading(false);
    }
  }, []);

  const fetchUserGroups = async () => {
    setIsLoading(true);
    const authHeaders = getAuthHeaders();
    if (!authHeaders) {
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/group/all`,
        { headers: authHeaders }
      );

      const data = await res.json();
      if (!res.ok) throw new Error();

      const memberGroups = [];

      for (const g of data.groups) {
        const memRes = await fetch(
          `${import.meta.env.VITE_API_URL}/group/members/${g.group_id}`,
          { headers: authHeaders }
        );

        if (!memRes.ok) continue;

        const memData = await memRes.json();
        const members = memData.members.map(m =>
          m.member_email.toLowerCase()
        );

        const isMemberOrOwner =
          members.includes(currentUserEmail) ||
          g.owner_email?.toLowerCase() === currentUserEmail;

        if (isMemberOrOwner) {
          memberGroups.push(g);
        }
      }

      setGroups(memberGroups);
    } catch {
      setError("Could not load your groups.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddMovie = async (groupId, groupName) => {
    setIsAdding(true);
    setIsOpen(false);
    setError(null);

    const authHeaders = getAuthHeaders();
    if (!authHeaders) return;

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/group/movie/add`,
        {
          method: "POST",
          headers: authHeaders,
          body: JSON.stringify({
            groupId: Number(groupId),
            movieId: Number(movieId),
          }),
        }
      );

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to add movie.");
        return;
      }

      setSuccessMessage(`"${movieTitle}" added to "${groupName}"`);

      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch {
      setError("Server error while adding movie.");
    } finally {
      setIsAdding(false);
    }
  };

  if (!currentUserEmail) return null;

  if (isLoading) {
    return (
      <button className="add-to-group-btn" disabled>
        Loading Groups...
      </button>
    );
  }

  if (groups.length === 0) {
    return (
      <div className="add-to-group-info">
        <p className="no-groups-text">
          Join or create a group to share this movie.
        </p>
        <Link to="/groups" className="secondary-btn">
          Go to Groups
        </Link>
      </div>
    );
  }

  return (
    <div className="add-to-group-dropdown-container">
      <button
        className="add-to-group-btn"
        onClick={() => setIsOpen(o => !o)}
        disabled={isAdding}
        aria-expanded={isOpen}
      >
        {isAdding ? "Adding..." : "Add to Group ▼"}
      </button>

      {isOpen && (
        <ul className="add-to-group-menu" role="menu">
          {groups.map(g => (
            <li key={g.group_id} role="none">
              <button
                type="button"
                role="menuitem"
                className="menu-item-btn"
                onClick={() => handleAddMovie(g.group_id, g.name)}
                disabled={isAdding}
              >
                {g.name}
              </button>
            </li>
          ))}
          {error && <li className="menu-error">{error}</li>}
        </ul>
      )}

      {successMessage && (
        <div className="add-to-group-success">
          {successMessage}
        </div>
      )}
    </div>
  );
}
