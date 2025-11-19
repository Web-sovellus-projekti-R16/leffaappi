import "./Groups.css"
import { Link } from "react-router-dom"


export default function Groups() {
  return (
    <div className="groups-container">
    <Link to="/home" className="groups-back">Back to Home</Link>

      <h2>Groups</h2>

      <div className="groups-search-wrapper">
        <input
          type="text"
          placeholder="Search"
          className="groups-search"
        />
      </div>

      <div className="groups-select-wrapper">
        <select className="groups-select">
          <option>Select group</option>
          <option>Group 1</option>
          <option>Group 2</option>
        </select>
        <button className="groups-send-btn">Send Request</button>
      </div>

      <h3 className="groups-section-title">Joined Groups</h3>
      <div className="groups-box">
        Joined groups here
      </div>

      <h3 className="groups-section-title">My Groups</h3>
      <div className="groups-box">
        Created groups
      </div>
    </div>
  )
}
