import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AvgRating from "../components/AvgRating"
import "./nowPlaying.css";

export default function NowPlaying() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ratings, setRatings] = useState({})
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/movies/nowplaying`);
        if (!res.ok) throw new Error("Failed to fetch now playing movies");
        const data = await res.json();
        setMovies(data)
        data.forEach(movie => loadRating(movie.tmdb_id))

      } catch (err) {
        console.error("NowPlaying failed:", err);
        setError("Failed to load movies. Try again later.")
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  
  async function loadRating(tmdb_id) {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/reviews/movie/tmdb/${tmdb_id}`)
    if (!res.ok) return
    const data = await res.json()
    setRatings(prev => ({ ...prev, [tmdb_id]: data }))
  }
  
  if (loading) return <p>Loading...</p>;
  if (error) return <p className="error">{error}</p>

  return (
    <section>
      <h2>Now on Theatres</h2>

      <div className="movie-grid">
        {movies.map(m => (
          <Link to={`/movie/${m.tmdb_id}`} key={m.tmdb_id} className="movie-card-link">
            <div className="movie-card">
              <h3>{m.title}</h3>
              <AvgRating reviews={ratings[m.tmdb_id] || []} />
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
