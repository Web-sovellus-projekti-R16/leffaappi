import { Link, useNavigate } from "react-router-dom"
import "./Account.css"

export default function Account() {
  const navigate = useNavigate()
  
  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete your account. It will be permanently deleted after 14 days."
    )

    if (!confirmDelete) return

    try {
      const token = localStorage.getItem("token")

      const result = await fetch(`${process.env.VITE_API_URL}/account/delete`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Authorization": "Bearer" + token,
          "Content-Type": "application/json"
        }
      })

      const data = await result.json()

      if (!result.ok) {
        alert(data.error || "Failed to delete account")
        return
      }

      alert("Account will be deleted.")
      localStorage.removeItem("token")
      navigate("/")
    } catch (err) {
      console.error("Account delete error:", err)
      alert("Server error occured during delete")
    }
  }

  return (
    <div className="account-container">
      <Link to="/" className="account-back">Back to Profile</Link>

      <div className="account-top-section">
        <div className="account-profile-row">
          <div className="account-avatar">
            👤
          </div>
          <span>Edit profile picture</span>
        </div>
      </div>

      <button className="account-delete-btn" onClick={handleDelete}>
        Delete Account
      </button>
    </div>
  )
}
