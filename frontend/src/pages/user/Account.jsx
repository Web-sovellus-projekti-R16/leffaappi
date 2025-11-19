import { Link } from "react-router-dom"
import "./Account.css"

export default function Account() {
  return (
    <div className="account-container">
      <Link to="/home" className="account-back">Back to Home</Link>

      <div className="account-top-section">
        <div className="account-profile-row">
          <div className="account-avatar">
            👤
          </div>
          <span>Edit profile picture</span>
        </div>
      </div>

      <button className="account-delete-btn">
        Delete Account
      </button>
    </div>
  )
}
