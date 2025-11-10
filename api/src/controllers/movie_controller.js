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
    const url = `https://api.themoviedb.org/3/movie/now_playing?api_key=${process.env.TMDB_API_KEY}&language=fi-FI&page=1`;
    const response = await fetch(url);
    const data = await response.json();
    res.json(data.results);
  } catch (err) {
    next(err);
  }
}
