import { useEffect, useState } from 'react';
import "./MovieExplorer.css";

export default function MovieExplorer() {
    const [movies, setMovies] = useState([]);
    const [searchBy, setSearchBy] = useState('title');
    const [query, setQuery] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const fetchMovie = async () => {
        if (!query.trim() || !searchBy.trim()) return;
        setLoading(true);
        setError(null);
        setMovies([]);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/movies/search/?${searchBy}=${query}`);
            if (res.status === 404) {
                setError(`No movie found for: "${query}"`);
                return;
            }

            if (!res.ok) throw new Error(`Server error: ${res.status}`);
            const data = await res.json();
            setMovies(Array.isArray(data) ? data : [data]);
        } catch (err) {
            console.error('Error occured while fetching movies:', err);
            setError('Something went wrong. Please try again later.');
        } finally {
            setLoading(false);
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
                    <div className='movie-card-bg' key={m.tmdb_id || m.id}>
                        <h2>{m.title}</h2>
                        <p>{m.overview}</p>
                        {m.poster_path && <img src={m.poster_path} alt={m.title} />}
                    </div>
                ))}
            </div>
        </div>
    )
}