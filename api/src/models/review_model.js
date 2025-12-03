import { pool } from "../helpers/db.js"

export const createReview = async (account_id, movie_id, rating, comment) => {
  return await pool.query(
    "INSERT INTO review (account_id, movie_id, rating, comment) VALUES ($1,$2,$3,$4) RETURNING *",
    [account_id, movie_id, rating, comment]
  )
}

export const updateReview = async (review_id, account_id, rating, comment) => {
  return await pool.query(
    "UPDATE review SET rating=$1, comment=$2 WHERE review_id=$3 AND account_id=$4 RETURNING *",
    [rating, comment, review_id, account_id]
  )
}

export const deleteReview = async (reviewId, accountId) => {
  return await pool.query(
    "UPDATE review SET rating = NULL, comment = NULL WHERE review_id=$1 AND account_id=$2 RETURNING *;",
    [reviewId, accountId]
  )
}

export const getReviewsByMovie = async (tmdb_id) => {
  return await pool.query(
    `SELECT r.*, a.email
     FROM review r
     JOIN account a ON r.account_id = a.account_id
     JOIN movie m ON r.movie_id = m.movie_id
     WHERE m.tmdb_id = $1
     ORDER BY r.created_at DESC`,
    [tmdb_id]
  )
}

export const getUserReviewForMovie = async (account_id, movie_id) => {
  return await pool.query(
    "SELECT * FROM review WHERE account_id=$1 AND movie_id=$2 LIMIT 1",
    [account_id, movie_id]
  )
}

export const getUserReviews = async (accountId) => {
  return await pool.query(`
        SELECT r.review_id, r.rating, r.comment, r.favorite, m.tmdb_id
        FROM review r
        JOIN movie m ON r.movie_id = m.movie_id
        WHERE r.account_id = $1`, [accountId])
}