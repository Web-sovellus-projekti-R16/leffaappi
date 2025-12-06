import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import "./Register.css"




export default function Register() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const navigate = useNavigate()

  function validpassword(password) {
    const minLength = password.length >= 8
    const hasUpper = /[A-Z]/.test(password)
    const hasNumber = /[0-9]/.test(password)

    return minLength && hasUpper && hasNumber
  }
  
  const registers = async (e) => {
  e.preventDefault()

  if (password !== confirm) {
    alert("Passwords do not match")
    return
  } else if (!validpassword(password)) {
    alert("Password needs 8 characters and contain an uppercase letter and a number")
    return
  }

  const res = await fetch(`${import.meta.env.VITE_API_URL}/account/register`, {
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

        <button type="submit" className="primary-btn">Submit</button>
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
