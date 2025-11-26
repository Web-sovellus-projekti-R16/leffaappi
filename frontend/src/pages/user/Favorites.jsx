import { Link } from "react-router-dom"
import { useEffect, useState } from "react"
import "./Favorites.css"

export default function Favorites() {
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("token");
  const isSignedIn = !!token;
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
        async function loadFavorites() {
            if (!isSignedIn) return;
            setLoading(true);

            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL}/movies/favorites`, {
                headers: {
                    "Authorization": "Bearer " + token,
                    "Content-Type": "application/json"
                },
                credentials: "include"
                });

                if (!res.ok) {
                  setFavorites([]);
                  setLoading(false);
                  return;
                }
                
                const favList = await res.json();
                const detailedFavorites = await Promise.all(
                  favList.map(async (fav) => {
                    const detailsRes = await fetch(`
                      ${import.meta.env.VITE_API_URL}/movies/tmdb?tmdb_id=${fav.tmdb_id}`
                    );
                    if (!detailsRes.ok) return null;
                    const raw = await detailsRes.json();
                    return {
                      tmdb_id: raw.id,
                      title: raw.title
                    };
                  })
                )

                setFavorites(detailedFavorites.filter(Boolean));
                
            } catch (err) {
                console.error("Failed to load favorites:", err);
            } finally {
              setLoading(false);
            }
        }

        loadFavorites();
    }, [isSignedIn])

  const handleRemoveFavorite = async (tmdb_id) => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${import.meta.env.VITE_API_URL}/movies/favorites`, {
        method: "DELETE",
        headers: {
          "Authorization": "Bearer " + token,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ tmdb_id })
      });

      if (!res.ok) {
        console.error("Failed to remove favorite");
        return;
      }

      setFavorites(prev => prev.filter(movie => movie.tmdb_id !== tmdb_id));
    } catch (err) {
      console.error("Error removing favorite:", err);
    }
  } 

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
        {loading && <p className='loading'>Loading...</p> }
        {!loading && favorites.length === 0 && <p>You don't have any favorites yet.</p>}
        {!loading && favorites.map((movie) => (
          <div key={movie.tmdb_id} className="favorites-item">
            <div className="favorites-info">
              <h3>{movie.title}</h3>
              <span>{movie.movie_id}</span>
            </div>
            <span>★★★★☆</span>
            <button className="favorites-delete-btn"
              onClick={() => handleRemoveFavorite(movie.tmdb_id)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  )
}
