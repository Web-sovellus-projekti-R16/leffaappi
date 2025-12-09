import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import "./ShareFavs.css";

export default function ShareFavs() {
  const { id } = useParams(); // shareId
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);
  const [notFound, setNotFound] = useState(false);
  const [owner, setOwner] = useState("");


  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/reviews/share/${id}`);

        if (res.status === 404) {
          setNotFound(true);
          setLoading(false);
          return;
        }

        const data = await res.json();
        setOwner(data.ownerName);
        setFavorites(data.favorites);
      } catch (err) {
        console.error("ShareFavs load error:", err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [id]);

  if (loading) return <p className="share-loading">Loading shared favorites...</p>;
  if (notFound) return <p className="share-error">This shared list doesn't exist anymore.</p>;

  return (
    <div className="share-container">
      <h2 className="share-title">
        {owner ? `${owner}'s Favorite Movielist` : "Shared Favorite Movielist"}
      </h2>

      {favorites.length === 0 && (
        <p className="share-empty">This user has no favorite movies.</p>
      )}

      <div className="share-list">
        {favorites.map(movie => (
          <div key={movie.tmdb_id} className="share-item">
            <Link to={`/movie/${movie.tmdb_id}`} className="share-clickable">
              {movie.poster_path && (
                <img src={movie.poster_path} alt={movie.title} className="share-poster"/>)}
              <div className="share-info">
                <h3>{movie.title}</h3>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
