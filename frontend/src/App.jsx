import { useEffect, useState } from "react";
import './App.css'
import MovieExplorer from './components/MovieExplorer'

function App() {
return (
    <MovieExplorer />
  )
  
}

export default App

// function App() {
//   const [query, setQuery] = useState("");
//   const [movies, setMovies] = useState([]);
//   const [loading, setLoading] = useState(false);

//   async function search(e) {
//     e.preventDefault();
//     if (!query) return;

//     setLoading(true);
//     try {
//       const res = await fetch(`http://localhost:3001/movies/search?q=${encodeURIComponent(query)}`);
//       const data = await res.json();
//       setMovies(data);
//     } catch (err) {
//       console.error("error haku: ", err);
//     } finally {
//       setLoading(false);
//     }
//   }
//   async function nowplaying() {
//   setLoading(true);
//   try {
//     const res = await fetch("http://localhost:3001/movies/nowplaying");
//     const data = await res.json();
//     setMovies(data);
//   } catch (err) {
//     console.error("error nowplayinh: ", err);
//   } finally {
//     setLoading(false);
//   }
// }


// useEffect(() => {
//   nowplaying();
// }, []);


//   return (
//     <div style={{ maxWidth: 800, margin: "2rem auto", fontFamily: "sans-serif" }}>
//       <h1>Elokuvahaku</h1>

//       <form onSubmit={search}>
//         <input
//           type="text"
//           value={query}
//           onChange={(e) => setQuery(e.target.value)}
//           placeholder="Hae elokuvia..."
//           style={{ padding: "8px", width: "70%" }}
//         />
//         <button type="submit" style={{ padding: "8px 16px", marginLeft: "8px" }}>
//           Hae
//         </button>
//       </form>
    
//       <button onClick={nowplaying} style={{ padding: "8px 16px", marginTop: "1rem" }}>
//         Now playing
//       </button>

//       {loading && <p>Loading movies...</p>}

//       <div style={{ marginTop: "2rem" }}>
//         {movies.length === 0 && !loading && <p>Ei tuloksia.</p>}

//         {movies.map((movie) => (
//           <div key={movie.id} style={{ marginBottom: "2rem", borderBottom: "1px solid #ccc", paddingBottom: "1rem" }}>
//             <h3>{movie.title}</h3>
//             {movie.poster_path && (
//               <img
//                 src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`}
//                 alt={movie.title}
//                 style={{ borderRadius: "8px" }}
//               />
//             )}
//             <p>{movie.overview}</p>
//             <small>Julkaiss uvuosi: {movie.release_date}</small>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }

// export default App;
