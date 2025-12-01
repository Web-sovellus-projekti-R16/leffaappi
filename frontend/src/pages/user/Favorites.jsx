import { Link } from "react-router-dom"
import { useEffect, useState } from "react"
import AvgRating from "../../components/AvgRating"
import Starss from "../../components/Starss"
import "./Favorites.css"

export default function Favorites() {
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("token");
  const isSignedIn = !!token;
  const [favorites, setFavorites] = useState([]);
  const [ratings, setRatings] = useState({})


  useEffect(() => {
    async function loadFavorites() {
      if (!isSignedIn) return;
      setLoading(true);

      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/reviews/account`, {
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
              title: raw.title,
              poster_path: raw.poster_path ? `https://image.tmdb.org/t/p/w300${raw.poster_path}` : null
            };
          })
        )

        const list = detailedFavorites.filter(Boolean)
        setFavorites(list)
        list.forEach(movie => loadRating(movie.tmdb_id))


      } catch (err) {
        console.error("Failed to load favorites:", err);
      } finally {
        setLoading(false);
      }
    }

    loadFavorites();
  }, [isSignedIn])

  const handleUpdateFavorite = async (moveId, grade, review) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/movies/favorites`, {
        method: "PUT",
        headers: {
          "Authorization": "Bearer " + token,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ moveId, grade, review })
      });
      
      if (!res.ok) {
        console.error("Error to update favorite")
      }

      const updated = await res.json()

      setFavorites(prev => prev.map(m => m.id === moveId ? 
        { ...m, grade: updated.grade, review: updated.review } : m
      ))
    } catch (err) {
      console.error("Error updating favorite:", err);
    }
  }

  const handleRemoveFavorite = async (review_id) => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${import.meta.env.VITE_API_URL}/reviews/${review_id}`, {
        method: "DELETE",
        headers: {
          "Authorization": "Bearer " + token
        }
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

  async function loadRating(tmdb_id) {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/reviews/movie/tmdb/${tmdb_id}`)
    if (!res.ok) return
    const data = await res.json()
    setRatings(prev => ({ ...prev, [tmdb_id]: data }))
  }

  const payload = token ? JSON.parse(atob(token.split(".")[1])) : null
  const userEmail = payload?.email

  async function submitReview(tmdb_id, rating, comment) {
    if (!token) return

    await fetch(`${import.meta.env.VITE_API_URL}/reviews/upsert`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        tmdb_id,
        rating,
        comment
      })
    })

    loadRating(tmdb_id)
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
        {loading && <p className='loading'>Loading...</p>}
        {!loading && favorites.length === 0 && <p>You don't have any favorites yet.</p>}
        {!loading && favorites.map((movie) => (
          <div key={movie.tmdb_id} className="favorites-item">
            <Link to={`/movie/${movie.tmdb_id}`} className="favorites-clickable">{movie.poster_path && (<img src={movie.poster_path} alt={movie.title} className="favorites-poster"/>)}
              <div className="favorites-info">
                <h3>{movie.title}</h3>
              </div>
            </Link>
            {ratings[movie.tmdb_id] && (
              <>
                {ratings[movie.tmdb_id].some(r => r.email === userEmail) ? (
                  <AvgRating reviews={ratings[movie.tmdb_id]} />
                ) : (
                  <div className="favorites-rate-box">
                    <h4 className="favorites-rate-title">Rate this movie</h4>
                    <Starss onSubmit={(rating, comment) => submitReview(movie.tmdb_id, rating, comment)} />
                  </div>
                )}
              </>
            )}
            <span className="favorites-id">{movie.movie_id}</span>
            <button className="favorites-delete-btn" onClick={() => handleRemoveFavorite(movie.review_id)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  )
}
