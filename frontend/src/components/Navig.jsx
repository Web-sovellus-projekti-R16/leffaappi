import { NavLink, useNavigate } from "react-router-dom"
import "./Navig.css"

export default function Navig() {
  const navigate = useNavigate()

  //if (loggeddin) navigate(dest) else navigate("/login")

  const logout = async () => {
    await fetch(`${import.meta.env.VITE_API_URL}/account/logout`, {
      method: "POST",
      credentials: "include"
    })
    localStorage.removeItem("token")
    navigate("/")
  }

  return (
    <nav className="navbar">

      <NavLink to={localStorage.getItem("token") ? "/home" : "/"} className="navlink">Home</NavLink>
      <NavLink to="/search" className="navlink">Search</NavLink>

      <NavLink to="/groups" className="navlink">Groups</NavLink>
      <NavLink to="/favorites" className="navlink">Favorites</NavLink>
      <NavLink to={localStorage.getItem("token") ? "/account" : "/login"} 
        className="navlink account">{localStorage.getItem("token") ? "Account" : "Sign In"}</NavLink>

      {localStorage.getItem("token") && (
        <button
          onClick={logout}
          className="navlink logout-btn"
        >
          Logout
        </button>
      )}

    </nav>
  )
}

