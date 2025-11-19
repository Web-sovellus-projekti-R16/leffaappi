import { NavLink, useNavigate } from "react-router-dom"
import "./Navig.css"

export default function Navig() {
  const navigate = useNavigate()

  //if (loggeddin) navigate(dest) else navigate("/login")

  const logout = () => {
    localStorage.removeItem("token")
    navigate("/")
  }

  return (
    <nav className="navbar">

      <NavLink to={localStorage.getItem("token") ? "/home" : "/"} className="navlink">Home</NavLink>
      <NavLink to="/search" className="navlink">Search</NavLink>

      <NavLink to="/groups" className="navlink">Groups</NavLink>
      <NavLink to="/favorites" className="navlink">Favorites</NavLink>
      <NavLink to="/account" className="navlink account">Account</NavLink>

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

