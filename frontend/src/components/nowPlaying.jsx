import { useEffect, useState } from "react";

export default function NowPlaying() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("http://localhost:3001/movies/nowplaying");
        const data = await res.json();
        setMovies(data);
      } catch (err) {
        console.error("NowPlaying failed:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <p>Ladataan elokuvia...</p>;

  return (
    <section>
      <h2>Nyt elokuvateattereissa</h2>
      <div className="movie-grid">
        {movies.map(m => (
          <div className="movie-card" key={m.tmdb_id}>
            {m.poster_path && (
              <img src={m.poster_path} alt={m.title} />
            )}
            <h3>{m.title}</h3>
          </div>
        ))}
      </div>
    </section>
  );
}
