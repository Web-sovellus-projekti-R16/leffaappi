import { useEffect, useState } from "react"
import { useParams, Link } from "react-router-dom"
import AvgRating from "../components/AvgRating"
import Starss from "../components/Starss"
import "./MoviePage.css"
import AddToGroupDropdown from "../components/AddToGroupDropdown.jsx";

export default function MoviePage() {
  const { id } = useParams()
  const token = localStorage.getItem("token")
  const target = token ? "/home" : "/"
  const [movie, setMovie] = useState(null)
  const [reviews, setReviews] = useState([])
  const payload = token ? JSON.parse(atob(token.split(".")[1])) : null
  const userEmail = payload?.email
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);

  async function loadReviews(tmdbId) {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/reviews/movie/tmdb/${tmdbId}`)
      if (!res.ok) return

      const reviews = await res.json()
      setReviews(reviews)
      const revz = reviews.find(r => r.email === userEmail);
      setIsFavorite(revz?.favorite === true);

    } catch (err) {
      console.error("Reviews load error:", err)
    }
  }

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const resMovie = await fetch(`${import.meta.env.VITE_API_URL}/movies/tmdb?tmdb_id=${id}`)
        if (!resMovie.ok) {
          return
        } 
      
        const raw = await resMovie.json()
        
        const movieData = {
          tmdb_id: raw.id,
          title: raw.title,
          overview: raw.overview,
          release_date: raw.release_date,
          runtime: raw.runtime,
          genres: raw.genres?.map(g => g.name) || [],
          languages: raw.spoken_languages?.map(l => l.english_name) || [],
          poster_path: raw.poster_path
            ? `https://image.tmdb.org/t/p/w500${raw.poster_path}`
            : null
        }

        setMovie(movieData)

        loadReviews(movieData.tmdb_id)
      } catch (err) {
        console.error("Movie load error:", err)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [id])

  async function submitReview(rating, comment) {
    if (!token) return
    await fetch(`${import.meta.env.VITE_API_URL}/reviews/upsert`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        tmdb_id: movie.tmdb_id,
        rating,
        comment
      })
    })
    loadReviews(movie.tmdb_id)
  }

  async function deleteReview(review_id) {
    if (!token) return

    await fetch(`${import.meta.env.VITE_API_URL}/reviews/${review_id}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    })

    loadReviews(movie.tmdb_id)
  }

  async function addFavorite() {
    if (!token || !movie) return;

    await fetch(`${import.meta.env.VITE_API_URL}/reviews/favorite`, {
      method: "POST", headers:
        { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ tmdb_id: movie.tmdb_id, favorite: true })
    });

    setIsFavorite(true);
  }

  async function removeFavorite() {
    if (!token || !movie) return;

    await fetch(`${import.meta.env.VITE_API_URL}/reviews/favorite`, {
      method: "POST", headers:
        { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ tmdb_id: movie.tmdb_id, favorite: false })
    });

    setIsFavorite(false);
  }
  if (!movie) return <p className="loading">Loading movie...</p>
  const filterreviev = reviews.filter(r => r.rating !== null);
  const average = filterreviev.length > 0 ? (filterreviev.reduce((sum, r) => sum + r.rating, 0) / filterreviev.length).toFixed(1) : null

  return (
    <div className="movie-page">
      <Link to={target} className="favorites-back">Back to Home</Link>
      {loading && <p className="loading">Loading...</p>}

      <div className="movie-header">
        <div className="poster-wrapper">
          {movie.poster_path && (
            <img className="poster" src={movie.poster_path} alt={movie.title} />
          )}
          {token && (
            <div className="movie-action-buttons">
                {!isFavorite ? (
                    <button className="favorite-add-btn" onClick={addFavorite}>Add to favorites</button>
                ) : (
                    <button className="favorite-add-btn" disabled>Favorited</button>
                )}
                
                <AddToGroupDropdown 
                    movieId={movie.tmdb_id}
                    movieTitle={movie.title}
                />
            </div>
          )}
        </div>

        <div className="info">
          <h1>{movie.title}</h1>
          <p className="meta">
            {movie.release_date?.slice(0, 4)} • {movie.runtime} min
          </p>
          <p className="meta">Genres: {movie.genres.join(", ")}</p>
          <p className="meta">Languages: {movie.languages.join(", ")}</p>
          <p className="overview">{movie.overview}</p>
          <p className="avg-label">Average reviews</p>
          <AvgRating reviews={filterreviev} />

          {token && (
            <div className="rating-wrapper">
              <h2>Rate this movie</h2>
              <Starss onSubmit={submitReview} />
            </div>
          )}
        </div>
      </div>

      <h2>Reviews</h2>
      <div className="reviews-list">
        {filterreviev.length === 0 && <p>No reviews yet</p>}

        {filterreviev.map(r => (
          <div key={r.review_id} className="review-box">

            <p><strong>{r.email}</strong></p>
            <p>⭐ {r.rating} / 5</p>
            <p>{r.comment}</p>
            <p>{new Date(r.created_at).toLocaleString()}</p>
            {r.email === userEmail && (<button className="secondary-btn" onClick={() => deleteReview(r.review_id)}>Delete review</button>)}
          </div>
        ))}
      </div>
    </div>
  )
}