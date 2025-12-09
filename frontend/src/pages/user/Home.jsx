import { Link } from "react-router-dom"
import MovieExplorer from "../../components/MovieExplorer"
import NowPlaying from "../../components/nowPlaying"
import "./Home.css"

export default function Home() {

  const token = localStorage.getItem("token");
  const payload = token ? JSON.parse(atob(token.split(".")[1])) : null;
  const email = payload?.email;

  const username = email ? email.split("@")[0] : "user";



  return (
    <div className="home-container">
      <h1 className="home-title">Welcome, {username}</h1>

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
