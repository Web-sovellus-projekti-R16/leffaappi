import { pool } from '../helpers/db.js'

export const getMovieByTmdbId = async (tmdbId) => {
    return await pool.query('SELECT * FROM movie WHERE tmdb_id = $1', [tmdbId])
}

export const insertMovie = async (movie) => {
    const query = `
        INSERT INTO movie (tmdb_id)
        VALUES ($1)
        RETURNING *
    `
    return await pool.query(query, [movie.id])
}

export const getFavoriteMovies = async (accountId) => {
    return await pool.query(`
        SELECT m.tmdb_id
        FROM account_movie am
        JOIN movie m ON am.movie_id = m.id
        WHERE am.account_id = $1`, [accountId])
} 

export const insertFavoriteMovie = async (accountId, movieId) => {
    return await pool.query(`
        INSERT INTO account_movie (account_id, movie_id)
        VALUES ($1, $2)
        RETURNING *`, [accountId, movieId])
}

export const deleteFavoriteMovie = async (accountId, movieId) => {
    return await pool.query(`
        DELETE FROM account_movie
        WHERE account_id = $1 AND movie_id = $2
        RETURNING *`, [accountId, movieId])
}