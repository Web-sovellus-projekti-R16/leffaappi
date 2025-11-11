import { getCurrentlyOnTheatres } from "../helpers/tmdbService.js";
import dotenv from "dotenv";
dotenv.config();

export async function search(req, res, next) {
  try {
    const query = req.query.q || "inception";
    const url = `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(
      query
    )}&api_key=${process.env.TMDB_API_KEY}&language=fi-FI`;

    const response = await fetch(url);
    const data = await response.json();

    res.json(data.results);
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
