import { getCurrentlyOnTheatres,
  searchMoviesByTitle, searchMoviesByGenre, searchMoviesByActor } from "../helpers/tmdbService.js";
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
