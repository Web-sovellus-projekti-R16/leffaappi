import { pool } from "../helpers/db.js"

export const createReview = (account_id, movie_id, rating, comment) => {
  return pool.query(
    "INSERT INTO review (account_id, movie_id, rating, comment) VALUES ($1,$2,$3,$4) RETURNING *",
    [account_id, movie_id, rating, comment]
  )
}

export const updateReview = (review_id, account_id, rating, comment) => {
  return pool.query(
    "UPDATE review SET rating=$1, comment=$2 WHERE review_id=$3 AND account_id=$4 RETURNING *",
    [rating, comment, review_id, account_id]
  )
}

export const deleteReview = (review_id, account_id) => {
  return pool.query(
    "DELETE FROM review WHERE review_id=$1 AND account_id=$2 RETURNING review_id",
    [review_id, account_id]
  )
}

export const getReviewsByMovie = (tmdb_id) => {
  return pool.query(
    `SELECT r.*, a.email
     FROM review r
     JOIN account a ON r.account_id = a.id
     JOIN movie m ON r.movie_id = m.id
     WHERE m.tmdb_id = $1
     ORDER BY r.created_at DESC`,
    [tmdb_id]
  )
}

export const getUserReviewForMovie = (account_id, movie_id) => {
  return pool.query(
    "SELECT * FROM review WHERE account_id=$1 AND movie_id=$2 LIMIT 1",
    [account_id, movie_id]
  )
}
