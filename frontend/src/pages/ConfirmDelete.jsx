import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./ConfirmDelete.css";

export default function ConfirmDelete() {
  const navigate = useNavigate();
  const [input, setInput] = useState("");
  const requiredPhrase = "delete-my-account";

  const handleConfirmDelete = async () => {
  if (input.trim().toLowerCase() !== requiredPhrase) {
    alert(`You must type exactly: "${requiredPhrase}"`);
    return;
  }

  try {
    const token = localStorage.getItem("token");

    const result = await fetch(`${import.meta.env.VITE_API_URL}/account/delete`, {
      method: "PUT",
      credentials: "include",
      headers: {
        "Authorization": "Bearer " + token,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        confirmation: input.trim().toLowerCase()
      })
    });

    const data = await result.json();

    if (!result.ok) {
      alert(data.error || "Failed to delete account");
      return;
    }

    alert("Account marked for deletion. It will be permanently removed in 14 days.");

    localStorage.removeItem("token");
    navigate("/");
  } catch (err) {
    console.error("Account delete error:", err);
    alert("Server error occurred during deletion.");
  }
};


  return (
    <div className="confirm-delete-container">
      <h2>Delete Your Account</h2>

      <p>
        This action will disable your account immediately and permanently delete it after 14 days.
      </p>

      <p>Please type the following phrase to confirm:</p>

      <div className="confirm-delete-phrase">
        <code>{requiredPhrase}</code>
      </div>

      <input
        type="text"
        className="confirm-delete-input"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type the phrase here..."
      />

      <button
        className="secondary-btn"
        onClick={handleConfirmDelete}
      >
        Confirm Delete
      </button>

      <Link to="/account" className="confirm-delete-cancel">
        Cancel
      </Link>
    </div>
  );
}
