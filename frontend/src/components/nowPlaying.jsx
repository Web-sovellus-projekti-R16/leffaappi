import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AvgRating from "../components/AvgRating"
import "./nowPlaying.css";

export default function NowPlaying() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ratings, setRatings] = useState({})


  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("http://localhost:3001/movies/nowplaying");
        const data = await res.json();
        setMovies(data)
        data.forEach(movie => loadRating(movie.tmdb_id))

      } catch (err) {
        console.error("NowPlaying failed:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <p>Loading...</p>;

  async function loadRating(tmdb_id) {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/reviews/movie/${tmdb_id}`)
  if (!res.ok) return
    const data = await res.json()
    setRatings(prev => ({ ...prev, [tmdb_id]: data }))
  }


  return (
    <section>
      <h2>Now on Theatres</h2>

      <div className="movie-grid">
        {movies.map(m => (
          <Link to={`/movie/${m.tmdb_id}`} key={m.tmdb_id} className="movie-card-link">
            <div className="movie-card">
              <h3>{m.title}</h3>
              <AvgRating reviews={ratings[m.tmdb_id]} />
              {m.poster_path && (
                <img src={m.poster_path} alt={m.title} />
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
