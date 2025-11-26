import { getCurrentlyOnTheatres,
  searchMoviesByTitle, searchMoviesByGenre, searchMoviesByActor,
  searchMovieByTmdbId } from "../helpers/tmdbService.js";
import { getMovieByTmdbId,
  insertMovie,
  getFavoriteMovies,
  insertFavoriteMovie as insertFavoriteMovieModel,
  deleteFavoriteMovie } from "../models/movie_model.js";
import dotenv from "dotenv";
dotenv.config();

export async function search(req, res, next) {
  try {
    const { title, genre, actor } = req.query;
    if (title) {
      // Hakee yhden elokuvan titlen perusteella
      const tmdbMovies = await searchMoviesByTitle(title)
      if (!tmdbMovies?.length) return res.status(404).json({ error: 'Movie not found' })
      
      return res.status(200).json(tmdbMovies)
    } else if (genre) {
        const tmdbMovies = await searchMoviesByGenre(genre)
        if (!tmdbMovies?.length) 
            return res.status(404).json({ error: 'No movies found for that genre' })
        
        //for (const m of tmdbMovies) await insertMovie(m.tmdb_id)
        return res.status(200).json(tmdbMovies)
    } else if (actor) {
        const tmdbMovies = await searchMoviesByActor(actor)
        if (!tmdbMovies?.length) return res.status(404).json({ error: 'No movies found for that actor' })
        
        //for (const m of tmdbMovies) await insertMovie(m.tmdb_id)
        return res.status(200).json(tmdbMovies)
    }

    return res.status(400).json({ error: 'Please provide title, genre, or actor as query param'})
  } catch (err) {
    console.error(err);
    next(err);
  }
}

export async function nowplaying(req, res, next) {
  try {
    const movies = await getCurrentlyOnTheatres();
    if (movies.length === 0) {
      return res.status(400).json({ error: 'Not found any movies' });
    }
    return res.status(200).json(movies)
  } catch (err) {
    next(err);
  }
}

export async function getByTmdbId(req, res, next) {
  try {
    const { tmdb_id } = req.query

    if (!tmdb_id) {
      return res.status(400).json({ error: "Missing tmdb_id parameter" })
    }

    const movie = await searchMovieByTmdbId(tmdb_id)

    if (!movie) {
      return res.status(404).json({ error: "Movie not found in TMDB" })
    }

    return res.status(200).json(movie)
  } catch (err) {
    console.error("searchMovieTmdb error:", err)
    next(err)
  }
}

export async function getFavorites(req, res, next) {
  try {
    const accountId = req.user.id
    const favoriteMovies = await getFavoriteMovies(accountId)
    return res.json(favoriteMovies.rows)
  } catch (err) {
    console.error(err)
    next(err)
  }
}

export async function insertFavoriteMovie(req, res, next) {
  try {
    const accountId = req.user.id
    const { tmdb_id } = req.body

    if (!tmdb_id) {
      return res.status(400).json({ error: "Missing tmdb_id" })
    }

    let dbMovie = await getMovieByTmdbId(tmdb_id)
    let movie = dbMovie.rows[0] 

    if (!movie) {
      const tmdbMovie = await searchMovieByTmdbId(tmdb_id)
      if (!tmdbMovie) {
        return res.status(404).json({ error: "Movie not found in TMDB" })
      }
      const inserted = await insertMovie(tmdbMovie)
      movie = inserted.rows[0]
    }

    const result = await insertFavoriteMovieModel(accountId, movie.id)
    if (result.rowCount === 0) {
      return res.status(400).json({ error: 'Failed to insert favorite movie' })
    }
    return res.status(200).json(result.rows[0])
  } catch (err) {
    console.error(err)
    next(err)
  }
}

export async function removeFavoriteMovie(req, res, next) {
  try {
    const accountId = req.user.id
    const { tmdb_id } = req.body

    if (!tmdb_id) {
      return res.status(400).json({ error: "Missing tmdb_id" })
    }

    const dbMovie = await getMovieByTmdbId(tmdb_id)
    if (dbMovie.rows.length === 0) {
      return res.status(404).json({ error: "Movie not found in database" })
    }
    const movieId = dbMovie.rows[0].id
    const result = await deleteFavoriteMovie(accountId, movieId)

    if (result.rowCount === 0) {
      return res.status(400).json({ error: "Movie was not found as account's favorite" })
    }
    return res.status(200).json({ message: "Favorite movie deleted successfully" })
  } catch (err) {
    console.error(err)
    next(err)
  }
}