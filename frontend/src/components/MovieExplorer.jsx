import { useEffect, useState } from 'react'

export default function MovieExplorer() {
    const [movies, setMovies] = useState([])
    const [title, setTitle] = useState('')
    const [genre, setGenre] = useState('')
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        
        const fetchData = async () => {
        setLoading(true)
        setError(null)
        setMovies([])
        try {
            const res = await fetch('http://localhost:3001/movies/ontheatres')

            if (!res.ok) throw new Error(`Server error: ${res.status}`)
            const data = await res.json()
            setMovies(Array.isArray(data) ? data : [data])
        } catch (err) {
            console.error('Error occured while fetching movies:', err)
            setError('Something went wrong. Please try again later.')
        } finally {
            setLoading(false)
        }}

        fetchData().catch(console.error)
    }, [])

    const fetchMovie = async (searchBy, queryString) => {
        if (!queryString.trim() || !searchBy.trim()) return
        setLoading(true)
        setError(null)
        setMovies([])
        try {
            const res = await fetch(`http://localhost:3001/movies/search/?${searchBy}=${queryString}`)
            if (res.status === 404) {
                setError(`No movie found for: "${queryString}"`)
                return
            }

            if (!res.ok) throw new Error(`Server error: ${res.status}`)
            const data = await res.json()
            setMovies(Array.isArray(data) ? data : [data])
        } catch (err) {
            console.error('Error occured while fetching movies:', err)
            setError('Something went wrong. Please try again later.')
        } finally {
            setLoading(false)
        }
    }
    

    return (
        <div>
            <input type='text' placeholder='Search by Title' value={title}
                onChange={e => setTitle(e.target.value)}
                onKeyDown={e => {
                    if (e.key === 'Enter') {
                        e.preventDefault()
                        fetchMovie('title', e.target.value)
                    }
                }} />

            <input type='text' placeholder='Search by Genre' value={genre}
                onChange={e => setGenre(e.target.value)}
                onKeyDown={e => {
                    if (e.key === 'Enter') {
                        e.preventDefault()
                        fetchMovie('genre', e.target.value)
                    }
                }} />
            
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