import { Link } from "react-router-dom"
import { useEffect } from "react"
import "./Favorites.css"

export default function Favorites() {

  return (
    <div className="favorites-container">
      <Link to="/home" className="favorites-back">Back to Home</Link>

      <h2 className="favorites-title">My Favorites</h2>

      <input
        type="text"
        placeholder="Search"
        className="favorites-search"
      />

      <div className="favorites-list">
        {[1, 2, 3].map(i => (
          <div key={i} className="favorites-item">
            <span>{`{movie title}`} ★★★★☆</span>
            <button className="favorites-delete-btn">Delete</button>
          </div>
        ))}
      </div>
    </div>
  )
}
