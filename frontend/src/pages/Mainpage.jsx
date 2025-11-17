import { Link } from "react-router-dom"
import MovieExplorer from "../components/MovieExplorer"
import NowPlaying from "../components/nowPlaying"
import "./MainPage.css"

export default function MainPage() {
  return (
    <div className="mainpage-container" > 
      <p className="mainpage-register-text">
        Do not have an account?{" "}
        <Link to="/register" className="mainpage-register-link">
          Please register here
        </Link>
      </p>

      <div className="home-explorer-wrapper">
        <MovieExplorer />
        <NowPlaying />
      </div>
    </div>
  )
}
