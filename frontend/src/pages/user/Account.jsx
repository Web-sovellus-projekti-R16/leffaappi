import { Link, useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import "./Account.css"

export default function Account() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)

  const [oldPassword, setOldPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordMessage, setPasswordMessage] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      navigate("/")
      return
    }

    const fetchProfile = async () => {
      try {
        const result = await fetch(`${import.meta.env.VITE_API_URL}/account/profile`, {
          method: "GET",
          headers: {
            "Authorization": "Bearer " + token
          },
          credentials: "include"
        })

        if (result.status === 401) {
          localStorage.removeItem("token");
          navigate("/")
          return
        }

        const data = await result.json()
        setProfile(data)
      } catch (err) {
        console.error("Profile fetch error:", err)
      }
    }
    fetchProfile()
  }, [navigate])

  const goToConfirmDelete = () => {
  navigate("/confirm-delete");
  };

  const handleChangePassword = async (e) => {
    e.preventDefault()
    setPasswordMessage(null)

    if (newPassword !== confirmPassword) {
      setPasswordMessage("New passwords do not match.")
      return
    }

    try {
      const token = localStorage.getItem("token")

      const result = await fetch(`${import.meta.env.VITE_API_URL}/account/password`, {
        method: "PUT",
        headers: {
          "Authorization": "Bearer " + token,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          oldPassword,
          newPassword
        }),
        credentials: "include"
      })

      const data = await result.json()

      if (!result.ok) {
        setPasswordMessage(data.error || "Failed to change password")
        return
      }

      setPasswordMessage("Password updated successfully!")
      setOldPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (err) {
      console.error("Password change error:", err)
      setPasswordMessage("Server error occured while changing password")
    }
  }
  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete your account. It will be permanently deleted after 14 days."
    )

    if (!confirmDelete) return

    try {
      const token = localStorage.getItem("token")

      const result = await fetch(`${import.meta.env.VITE_API_URL}/account/delete`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Authorization": "Bearer " + token,
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
      {/* <div className="account-top-section">
        <div className="account-profile-row">
          <div className="account-avatar">
            👤
          </div>
          <span>Edit profile picture</span>
        </div>
      </div> */}

      <div className="password-section">
        <h3>Change Password</h3>
        <form className="password-form" onSubmit={handleChangePassword}>
          <input type="password"
            placeholder="Old password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            required />

          <input type="password"
            placeholder="New password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required />

          <input type="password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required />

          <button type="submit" className="primary-btn">Change Password</button>
        </form>
        {passwordMessage && (
          <p>{passwordMessage}</p>
        )}
      </div>

      <button className="secondary-btn" onClick={goToConfirmDelete}>
        Delete Account
      </button>
    </div>
  )
}
