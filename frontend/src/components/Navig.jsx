import { NavLink, useNavigate } from "react-router-dom"
import "./Navig.css"

export default function Navig() {
  const navigate = useNavigate()

  const loggedin = (e, dest) => {
    e.preventDefault()

    //if (loggeddin) navigate(dest) else navigate("/login")
    navigate("/login")
  }

  return (
    <nav className="navbar">
      <NavLink to="/" className="navlink">Home</NavLink>
      <NavLink to="/search" className="navlink">Search</NavLink>

      <a href="/groups" onClick={(e) => loggedin(e, "/groups")} className="navlink">Groups</a>
      <a href="/favorites" onClick={(e) => loggedin(e, "/favorites")} className="navlink">Favorites</a>

      <a href="/account" onClick={(e) => loggedin(e, "/account")} className="navlink account">Account</a>
    </nav>
  )
}
