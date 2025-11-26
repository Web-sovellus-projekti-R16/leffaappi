import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./MoviePage.css";

export default function MoviePage() {
    const { id } = useParams();

    const [movie, setMovie] = useState(null);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");

    useEffect(() => {
        async function load() {
            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL}/movies/tmdb/${id}`);
                if (!res.ok) return;

                const raw = await res.json();

                setMovie({
                    tmdb_id: raw.id,
                    title: raw.title,
                    overview: raw.overview,
                    release_date: raw.release_date,
                    runtime: raw.runtime,
                    genres: raw.genres?.map(g => g.name) || [],
                    languages: raw.spoken_languages?.map(l => l.english_name) || [],
                    poster_path: raw.poster_path 
                        ? `https://image.tmdb.org/t/p/w500${raw.poster_path}`
                        : null
                });

            } catch (err) {
                console.error("Movie load error:", err);
            }
        }

        load();
    }, [id]);


    const submitReview = () => {
        console.log("):", { rating, comment });
        alert("");
        setRating(0);
        setComment("");
    };

    if (!movie) return <p className="loading">Loading movie...</p>;

    return (
        <div className="movie-page">

            <div className="movie-header">
                {movie.poster_path && (
                    <img className="poster" src={movie.poster_path} alt={movie.title} />
                )}

                <div className="info">
                    <h1>{movie.title}</h1>

                    <p className="meta">
                        {movie.release_date?.slice(0, 4)} • {movie.runtime} min
                    </p>

                    <p className="meta">Genres: {movie.genres.join(", ")}</p>
                    <p className="meta">Languages: {movie.languages.join(", ")}</p>

                    <p className="overview">{movie.overview}</p>
                </div>
            </div>

            <div className="review-section">
                <h2>Leave a review</h2>

                <select
                    value={rating}
                    onChange={(e) => setRating(Number(e.target.value))}
                >
                    <option value="0">Rate this movie</option>
                    {[1, 2, 3, 4, 5].map(n => (
                        <option key={n} value={n}>{n} ⭐</option>
                    ))}
                </select>

                <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Write your comment..."
                />

                <button onClick={submitReview}>Submit Review</button>
            </div>

            <h2>Reviews</h2>
            <div className="reviews-list">
                <p>No reviews yet</p>
            </div>

        </div>
    );
}
