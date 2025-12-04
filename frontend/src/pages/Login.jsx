import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import "./Login.css"

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const navigate = useNavigate()

  const logins = async (e) => {
    e.preventDefault()

    const res = await fetch(`${import.meta.env.VITE_API_URL}/account/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password })
    })

    const data = await res.json()

    if (res.status === 403 && data.error?.includes("Account is deleted")) {
      const restoreRes = await fetch(`${import.meta.env.VITE_API_URL}/account/restore`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password })
      })

      const restoreData = await restoreRes.json()

      if (!restoreData.ok) {
        alert(restoreData.error || "Restore failed")
        return
      }

      localStorage.setItem("token", restoreData.token)
      localStorage.setItem("email", restoreData.account.email)
      localStorage.setItem("userId", restoreData.account.id)
      
      alert("Your account has been restored and you're now signed in.")
      navigate("/home")
      return
    }

    if (!res.ok) {
      
      alert(data.error || "Login failed")
      return
    }

    localStorage.setItem("token", data.token)
    
    if (data.account && data.account.email) {
        localStorage.setItem("email", data.account.email)
    }
    
    if (data.account && data.account.id) {
        localStorage.setItem("userId", data.account.id) 
    }

    navigate("/home")
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

        <button type="submit" className="primary-btn">Sign In</button>
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
