import MovieExplorer from "../components/MovieExplorer"
import "./Search.css"

export default function Search() {
  return (
    <div className="search-container">
      <h2 className="search-title">Search Movies</h2>
        <div className="home-explorer-wrapper">
            <MovieExplorer />
        </div>
    </div>
  )
}
