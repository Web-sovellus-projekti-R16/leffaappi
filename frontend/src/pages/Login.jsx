import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import "./Login.css"

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const navigate = useNavigate()

  const logins = (e) => {
    e.preventDefault()
    navigate("/account")
  }

  return (
    <div className="login-container">
      <h2>Login</h2>

      <form onSubmit={logins} className="login-form">
        <div className="login-field">
          <label>Email</label><br />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
          />
        </div>

        <div className="login-field">
          <label>Password</label><br />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
          />
        </div>

        <button type="submit" className="login-btn">Sign In</button>
      </form>

      <p className="login-register-text">
        Don’t have an account?{" "}
        <Link to="/register" className="login-register-link">
          Register here
        </Link>
      </p>
    </div>
  )
}
