import { useEffect, useState } from 'react';
import { Link } from "react-router-dom";
import AvgRating from "../components/AvgRating"


import "./MovieExplorer.css";

export default function MovieExplorer() {
    const [movies, setMovies] = useState([]);
    const [searchBy, setSearchBy] = useState('title');
    const [query, setQuery] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const token = localStorage.getItem("token");
    const isSignedIn = !!token;
    const [favorites, setFavorites] = useState([]);
    const [ratings, setRatings] = useState({})


    useEffect(() => {
        async function loadFavorites() {
            if (!isSignedIn) return;

            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL}/movies/favorites`, {
                headers: {
                    "Authorization": "Bearer " + token,
                    "Content-Type": "application/json"
                },
                credentials: "include"
                });

                if (res.ok) {
                    const data = await res.json();
                    setFavorites(data.map(m => m.tmdb_id));
                }
            } catch (err) {
                console.error("Failed to load favorites:", err);
            }
        }

        loadFavorites();
    }, [isSignedIn])
    async function loadRating(tmdb_id) {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/reviews/movie/${tmdb_id}`)
    if (!res.ok) return
    const data = await res.json()
    setRatings(prev => ({ ...prev, [tmdb_id]: data }))
    }
    const fetchMovie = async () => {
        if (!query.trim() || !searchBy.trim()) return;
        setLoading(true);
        setError(null);
        setMovies([]);
        try {
            const res = await fetch(`http://localhost:3001/movies/search/?${searchBy}=${query}`);
            if (res.status === 404) {
                setError(`No movie found for: "${query}"`);
                return;
            }

            if (!res.ok) throw new Error(`Server error: ${res.status}`);
            const data = await res.json();
            setMovies(Array.isArray(data) ? data : [data]);
            (Array.isArray(data) ? data : [data]).forEach(movie => {loadRating(movie.tmdb_id)})
        } catch (err) {
            console.error('Error occured while fetching movies:', err);
            setError('Something went wrong. Please try again later.');
        } finally {
            setLoading(false);
        }
    }
    
    


    async function addFavorite(tmdb_id) {
        if (!isSignedIn) {
            console.warn("No user logged in");
            return;
        }
        
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/movies/favorites`, {
            method: "POST",
            headers: {
                "Authorization": "Bearer " + token,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ tmdb_id }),
            credentials: "include"
            })

            const data = await response.json()
            console.log("FavMovie response:", data)

            if (!response.ok) {
            console.error("FavMovie failed:", data.error)
            }

            setFavorites(prev => [...prev, tmdb_id]);
        } catch (err) {
            console.error("FavMovie test error:", err)
        }
    }

    return (
        <div className='container'>
            <p>Search movies by <strong>title</strong>, <strong>genre</strong>, or <strong>actor</strong>.</p>
            
            <div className='search-bar'>
                <select value={searchBy} onChange={(e) => setSearchBy(e.target.value)}>
                    <option value="title">Title</option>
                    <option value="genre">Genre</option>
                    <option value="actor">Actor</option>
                </select>
                <input type='text' placeholder={`Search by ${searchBy}`} value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            fetchMovie();
                        }
                    }} />

                <button onClick={fetchMovie}>Search</button>
            </div>

            {loading && <p className='loading'>Loading...</p> }
            {error && <p className='error'>{error}</p>}
            <div className='movie-grid-bg'>
                {movies.map((m) => (
                    <Link to={`/movie/${m.tmdb_id}`} className='movie-card-bg' key={m.tmdb_id || m.id}>
                        <h2>{m.title}</h2>
                        <p>{m.overview}</p>
                        <div className="search-card-rating">
                            <AvgRating reviews={ratings[m.tmdb_id]} />
                        </div>
                        {m.poster_path && <img src={m.poster_path} alt={m.title} />}
                        {isSignedIn && (
                            <button className='fav-button'
                                disabled={favorites.includes(m.tmdb_id)} 
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); addFavorite(m.tmdb_id); }}>
                                {favorites.includes(m.tmdb_id) ? "Favorited" : "Add to favorites"}
                            </button>
                        )}
                    </Link>
                ))}
            </div>
        </div>
    )
}