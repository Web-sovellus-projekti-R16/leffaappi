import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import "./GroupPage.css";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  if (!token) {
    console.error("Authentication token not found.");
    return null;
  }
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`, 
  };
};

export default function GroupPage() {
  const { groupId } = useParams();
  const [group, setGroup] = useState(null);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (groupId) {
      fetchGroupDetails(groupId);
      fetchGroupMovies(groupId);
    }
  }, [groupId]);

  const fetchGroupDetails = async (id) => {
    setLoading(true);
    setError(null);
    const authHeaders = getAuthHeaders();
    if (!authHeaders) {
      setError("Authentication failed.");

      return; 
    }

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/group/${id}`, {
        method: "GET",
        headers: authHeaders,
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to fetch group details.");
        setGroup(null);
        return;
      }

      setGroup(data.group);
    } catch (err) {
      console.error("Group detail fetch error:", err);
      setError("Network or server error while fetching group.");
    } finally {

    }
  };

  const fetchGroupMovies = async (id) => {
    const authHeaders = getAuthHeaders();
    if (!authHeaders) {
        setLoading(false);
        return;
    }

    try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/group/movies/${id}`, {
            method: "GET",
            headers: authHeaders,
        });

        const data = await res.json();
        if (!res.ok) {
            console.error("Failed to fetch group movies:", data.error);
            setMovies([]);
            return;
        }

        setMovies(data.movies);
    } catch (err) {
        console.error("Group movies network error:", err);
    } finally {
        setLoading(false);
    }
  };


  if (loading) {
    return (
      <div className="group-page-container">
        <h2>Loading Group Details...</h2>
      </div>
    );
  }

  if (error || !group) { 
    return (
      <div className="group-page-container">
        <Link to="/groups" className="group-page-back">
          ← Back to Groups List
        </Link>
        <h2>Error</h2>
        <p>{error || "Group data is missing or could not be loaded."}</p>
      </div>
    );
  }

  return (
    <div className="group-page-container">
      <Link to="/groups" className="group-page-back">
        ← Back to Groups List
      </Link>
      
      <div className="group-header-info">
        <h1>{group.name}</h1> 
        <p className="group-owner">Owner: {group.owner_email}</p>
      </div>

      <div className="group-details">
        <h3>Description</h3>
        <p>{group.description || "No description provided."}</p>
      </div>
      

      <div className="group-movies-list">
        <h3>Shared Movies ({movies.length})</h3>
        
        {movies.length === 0 ? (
          <p>No movies have been added to this group yet. Add one from a movie's page!</p>
        ) : (
          <div className="movies-grid">
            {movies.map((movie) => (
                <Link to={`/movie/${movie.tmdb_id}`} key={movie.tmdb_id} className="movie-card-link">
                  <div className="group-movie-card">
                    {movie.poster_path ? (
                        <img src={movie.poster_path} alt={movie.title} className="movie-poster" />
                    ) : (
                        <div className="no-poster">No Image</div>
                    )}
                    <div className="movie-card-info">
                      <h4>{movie.title}</h4>
                      <p className="movie-year">{movie.release_date?.slice(0, 4)}</p>
                    </div>
                  </div>
                </Link>
            ))}
          </div>
        )}
      </div>

     
    </div>
  );

}
