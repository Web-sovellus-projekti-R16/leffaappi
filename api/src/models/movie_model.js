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