import { useEffect, useState } from 'react';

export default function MovieExplorer() {
    const [movies, setMovies] = useState([]);
    const [searchBy, setSearchBy] = useState('title');
    const [query, setQuery] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        
        const fetchData = async () => {
        setLoading(true);
        setError(null);
        setMovies([]);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/movies/nowplaying`);

            if (!res.ok) throw new Error(`Server error: ${res.status}`);
            const data = await res.json();
            setMovies(Array.isArray(data) ? data : [data]);
        } catch (err) {
            console.error('Error occured while fetching movies:', err);
            setError('Something went wrong. Please try again later.');
        } finally {
            setLoading(false);
        }}

        fetchData().catch(console.error);
    }, [])

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
        <div>
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
            
            <h1>Movies</h1>

            {loading && <p>Loading...</p> }
            {error && <p>{error}</p>}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                {movies.map((m) => (
                    <div key={m.tmdb_id || m.id} style={{ width: '200px' }}>
                        <h2>{m.title}</h2>
                        <p>{m.overview}</p>
                        {m.poster_path && <img src={m.poster_path} alt={m.title} width={'200'} />}
                    </div>
                ))}
            </div>
        </div>
    )
}