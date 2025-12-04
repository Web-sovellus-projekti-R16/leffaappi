import { NavLink, useNavigate } from "react-router-dom"
import "./Navig.css"
import bg from "../assets/img/pexels-jplenio-1118873.jpg"

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
    <nav className="navbar" style={{ 
      backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.5), rgba(0,0,0,0)),
                    linear-gradient(to top, rgba(0,0,0,0.6), rgba(0,0,0,0)),
                    url(${bg})`}}>

      <NavLink to={localStorage.getItem("token") ? "/home" : "/"} className="navlink">Home</NavLink>
      <NavLink to="/groups" className="navlink">Groups</NavLink>
      <NavLink to="/favorites" className="navlink">Favorites</NavLink>
      <NavLink to={localStorage.getItem("token") ? "/account" : "/login"} 
        className="navlink account">{localStorage.getItem("token") ? "Account" : "Sign In"}</NavLink>

      {localStorage.getItem("token") && (
        <button
          onClick={logout}
          className="primary-btn"
        >
          Logout
        </button>
      )}

    </nav>
  )
}

