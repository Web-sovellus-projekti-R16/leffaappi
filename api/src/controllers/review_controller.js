import {
  createReview,
  updateReview,
  deleteReview,
  getReviewsByMovie,
  getUserReviewForMovie,
  getUserReviews
} from "../models/review_model.js"
import { getMovieByTmdbId, insertMovie } from "../models/movie_model.js"
import { searchMovieByTmdbId } from "../helpers/tmdbService.js"

async function resolveMovieId(tmdb_id) {
  const dbMovie = await getMovieByTmdbId(tmdb_id)
  let movieRecord = dbMovie.rows[0]

  if (!movieRecord) {
    const tmdbMovie = await searchMovieByTmdbId(tmdb_id)
    if (!tmdbMovie) return null
    const inserted = await insertMovie(tmdbMovie)
    movieRecord = inserted.rows[0]
  }
  
  return movieRecord.movie_id
}

export const addReview = async (req, res) => {
  try {
    const account_id = req.user.id
    const { tmdb_id, rating, comment } = req.body
    if (!tmdb_id || !rating) {
      return res.status(400).json({ error: "tmdb_id and rating are required" })
    }
    const movieId = await resolveMovieId(tmdb_id)
    if (!movieId) return res.status(404).json({ error: "Movie not found" })
    const existing = await getUserReviewForMovie(account_id, movieId)
    if (existing.rows.length > 0) {
      const reviewId = existing.rows[0].review_id
      const updated = await updateReview(
        reviewId,
        account_id,
        rating,
        comment
      )
      return res.json({ message: "updated", review: updated.rows[0] })
    }
    const inserted = await createReview(account_id, movieId, rating, comment)
    return res.json({ message: "inserted", review: inserted.rows[0] })
  } catch (err) {
    console.error("addReview error:", err)
    res.status(500).json({ error: "Server error" })
  }
}


export const editReview = async (req, res) => {
  try {
    const account_id = req.user.id
    const review_id = req.params.id
    const { rating, comment } = req.body
    const result = await updateReview(review_id, account_id, rating, comment)
    if (result.rows.length === 0) return res.status(403).json({ error: "No permission" })
    res.json(result.rows[0])
  } catch (err) {
    console.error("editReview error:", err)
    res.status(500).json({ error: "Server error" })
  }
}

export const removeReview = async (req, res) => {
  try {
    const account_id = req.user.id
    const tmdb_id = req.params.tmdb_id
    
    if (!tmdb_id) return res.status(400).json({ error: "tmdb_id is required"})

    const movieId = await resolveMovieId(tmdb_id)

    if (!movieId) return res.status(404).json({ error: "Movie not found" })
    const result = await deleteReview(account_id, movieId)
    if (result.rows.length === 0) return res.status(404).json({ error: "Review not found" })
    res.json({ success: true })
  } catch (err) {
    console.error("removeReview error:", err)
    res.status(500).json({ error: "Server error" })
  }
}

export const movieReviews = async (req, res) => {
  try {
    const tmdb_id = req.params.movie_id;
    const result = await getReviewsByMovie(tmdb_id)
    res.json(result.rows)
  } catch (err) {
    console.error("movieReviews error:", err)
    res.status(500).json({ error: "Server error" })
  }
}

export const userReviews = async (req, res) => {
  try {
    const accountId = req.user.id
    const result = await getUserReviews(accountId)
    res.json(result.rows)
  } catch (err) {
    console.error("userReviews error:", err)
    res.status(500).json({ error: "Server error" })
  }
}