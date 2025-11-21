import { Link } from "react-router-dom"
import MovieExplorer from "../../components/MovieExplorer"
import NowPlaying from "../../components/nowPlaying"
import "./Home.css"

export default function Home() {

  return (
    <div className="home-container">
      <h1 className="home-title">Welcome, user</h1>

      <div className="home-links">
        <Link to="/groups">My Groups</Link>
        <Link to="/favorites">My Favorites</Link>
        <Link to="/account">Profile Settings</Link>
      </div>

      <div className="home-explorer-wrapper">
        <MovieExplorer />
        <NowPlaying />
      </div>
    </div>
  )
}
