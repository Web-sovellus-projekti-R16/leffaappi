import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import "./Register.css"

export default function Register() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const navigate = useNavigate()

  const registers = async (e) => {
  e.preventDefault()

  if (password !== confirm) {
    alert("Passwords do not match")
    return
  }

  const res = await fetch("http://localhost:3001/account/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  })

  const data = await res.json()

  if (!res.ok) {
    alert(data.error || "Registration failed")
    return
  }

  navigate("/login")
}


  return (
    <div className="register-container">
      <h2>Register</h2>

      <form onSubmit={registers} className="register-form">
        <div className="register-field">
          <label>Email</label><br />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="register-field">
          <label>Password</label><br />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div className="register-field">
          <label>Confirm Password</label><br />
          <input
            type="password"
            placeholder="Confirm password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
        </div>

        <button type="submit" className="register-btn">Submit</button>
      </form>

      <p className="register-login-text">
        Already have an account?{" "}
        <Link to="/login" className="register-login-link">
          Login here
        </Link>
      </p>
    </div>
  )
}
