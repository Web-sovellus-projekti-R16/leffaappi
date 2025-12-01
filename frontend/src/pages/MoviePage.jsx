import { useEffect, useState } from "react"
import { useParams, Link } from "react-router-dom"
import AvgRating from "../components/AvgRating"
import Starss from "../components/Starss"
import "./MoviePage.css"

export default function MoviePage() {
  const { id } = useParams()
  const token = localStorage.getItem("token")
  const target = token ? "/home" : "/"
  const [movie, setMovie] = useState(null)
  const [reviews, setReviews] = useState([])
  const payload = token ? JSON.parse(atob(token.split(".")[1])) : null
  const userEmail = payload?.email
  const [favorites, setFavorites] = useState([])

  async function loadReviews(tmdbId) {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/reviews/movie/tmdb/${tmdbId}`)
        if (!res.ok) return
        
        const reviews = await res.json()
        setReviews(reviews)
      
    } catch (err) {
      console.error("Reviews load error:", err)
    }
  }

  useEffect(() => {
    async function load() {
      try {
        // Loading movie data
        const resMovie = await fetch(`${import.meta.env.VITE_API_URL}/movies/tmdb/${id}`)
        if (!resMovie.ok) return

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

        // Loading review data
        loadReviews(movieData.tmdb_id)
      } catch (err) {
        console.error("Movie load error:", err)
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

  async function addFavorite(tmdb_id) {
    if (!token) return
    
    const res = await fetch(`${import.meta.env.VITE_API_URL}/movies/favorites`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ tmdb_id })
    })

    if (res.ok) {
      setFavorites(prev => [...prev, tmdb_id])
    }
  }



  if (!movie) return <p className="loading">Loading movie...</p>
  
  const average = reviews.length > 0? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : null

  return (
    <div className="movie-page">
      <Link to={target} className="favorites-back">Back to Home</Link>

      <div className="movie-header">
        {movie.poster_path && (
          <img className="poster" src={movie.poster_path} alt={movie.title} />
        )}        
        
        <div className="info">
          <h1>{movie.title}</h1>
          <p className="meta">
            {movie.release_date?.slice(0, 4)} • {movie.runtime} min
          </p>
          <p className="meta">Genres: {movie.genres.join(", ")}</p>
          <p className="meta">Languages: {movie.languages.join(", ")}</p>
          <p className="overview">{movie.overview}</p>
          <p className="avg-label">Average reviews</p>
        <AvgRating reviews={reviews} />

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
        {reviews.length === 0 && <p>No reviews yet</p>}

        {reviews.map(r => (
          <div key={r.review_id} className="review-box">

            <p><strong>{r.email}</strong></p>
            <p>⭐ {r.rating} / 5</p>
            <p>{r.comment}</p>
            <p>{new Date(r.created_at).toLocaleString()}</p>
            {r.email === userEmail && (<button className="review-delete-btn" onClick={() => deleteReview(r.review_id)}>Delete review</button>)}
          </div>
        ))}
      </div>
    </div>
  )
}
