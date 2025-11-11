import axios from 'axios'
import dotenv from 'dotenv'
dotenv.config()

let genreCache = null

export async function getCurrentlyOnTheatres() {
    try {
        const response = await axios.get(`${process.env.TMDB_BASE_URL}/movie/now_playing`, {
          headers: {
            'Authorization': `Bearer ${process.env.TMDB_BEARER}`,
            'Accept': 'application/json'
          }
        });

        const results = response.data.results || [];

        return results.slice(0, 5).map(movie => ({
            tmdb_id: movie.id,
            title: movie.title,
            overview: movie.overview,
            genre: null,
            poster_path: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null
        }));
    } catch (err) {
        console.error('TMDB fetch currently on theatres failed:', err.message);
    }
}

export async function searchMovie(title) {
    try {
        const response = await axios.get(`${process.env.TMDB_BASE_URL}/search/movie`, {
          headers: {
            'Authorization': `Bearer ${process.env.TMDB_BEARER}`,
            'Accept': 'application/json'
          },
          params: { query: title }
        })
        const movie = response.data.results[0]
        if (!movie) return null

        const genres = await fetchGenres()
        const genreObj = genres.find(g => g.id === movie.genre_ids?.[0])
        
        const posterPath = await fetchImage(movie.id)

        return {
            tmdb_id: movie.id,
            title: movie.title,
            overview: movie.overview,
            genre: genreObj ? genreObj.name : null,
            poster_path: posterPath ? `https://image.tmdb.org/t/p/w500${posterPath}` : null
        }
    } catch (err) {
        console.error('TMDB search by title fetch failed:', err.message)
    }
}

export async function searchMoviesByGenre(genreName) {
    try {
        const genres = await fetchGenres()
        const genreObj = genres.find(g => g.name.toLowerCase() === genreName.toLowerCase())
        if (!genreObj) return []

        const response = await axios.get(`${process.env.TMDB_BASE_URL}/discover/movie`, {
          headers: {
            'Authorization': `Bearer ${process.env.TMDB_BEARER}`,
            'Accept': 'application/json'
          },
          params: { with_genres: genreObj.id }
        })
        const results = response.data.results || []
        return results.map(movie => ({
            tmdb_id: movie.id,
            title: movie.title,
            overview: movie.overview,
            genre: genreObj.name,
            poster_path: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null
        }))
    } catch (err) {
        console.error('TMDB genre search failed:', err.message)
        return []
    }
}

export async function searchMoviesByActor(actorName) {
    try {
        const response = await axios.get(`${process.env.TMDB_BASE_URL}/search/person`, {
          headers: {
            'Authorization': `Bearer ${process.env.TMDB_BEARER}`,
            'Accept': 'application/json'
          },
          params: { query: actorName }
        });

        const person = response.data.results?.[0];
        if (!person || !person.known_for) return [];

        const genres = await fetchGenres();

        const movies = person.known_for.map(movie => {
          const movieGenres = (movie.genre_ids || [])
            .map(id => genres.find(g => g.id === id)?.name)
            .filter(Boolean);

          return {
            tmdb_id: movie.id,
            title: movie.title || movie.name,
            overview: movie.overview,
            genres: movieGenres,
            poster_path: movie.poster_path
              ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
              : null
          };
        });

        return movies;
    } catch (err) {
        console.error('TMDB actor search failed:', err.message);
        return [];
    }
}

async function fetchGenres() {
  if (genreCache) return genreCache
  try {
    const response = await axios.get(`${process.env.TMDB_BASE_URL}/genre/movie/list`, {
      headers: {
        'Authorization': `Bearer ${process.env.TMDB_BEARER}`,
        'Accept': 'application/json'
      }
    })
    genreCache = response.data.genres
    return genreCache
  } catch (err) {
    console.log('Failed to fetch genres from TMDB:', err.message)
  }
}

async function fetchImage(id) {
  try {
    const response = await axios.get(`${process.env.TMDB_BASE_URL}/movie/${id}/images`, {
      headers: {
        'Authorization': `Bearer ${process.env.TMDB_BEARER}`,
        'Accept': 'application/json'
      }
    })

    const posters = response.data.posters
    if (posters && posters.length > 0) {
      return posters[0].file_path
    }
    const backdrops = response.data.backdrops
    if (backdrops && posters.length > 0) {
      return backdrops[0].file_path
    }
    return null
  } catch (err) {
    console.log('Failed to fetch images from TMDB:', err.message)
    return null
  }
}