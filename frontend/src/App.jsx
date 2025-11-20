import { useEffect, useState } from "react";
import './App.css'
import Navig from "./components/Navig"
import {Route, Routes} from 'react-router-dom'
import Mainpage from "./pages/Mainpage"
import Login from "./pages/Login"
import Register from "./pages/Register"
import MovieExplorer from "./components/MovieExplorer"
import Home from "./pages/user/Home"
import Groups from "./pages/user/Groups"
import Favorites from "./pages/user/Favorites"
import Account from "./pages/user/Account"
import Search from "./pages/Search"
import NowPlaying from "./components/nowPlaying.jsx";
import ProtectedRoute from "./components/ProtectedRoute"



function App() {

  //const [loggedin, setLoggedIn] = useState(!!localStorage.getItem("token"))

  return (
    <>
      <Navig />

      <Routes>

        <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/groups" element={<ProtectedRoute><Groups /></ProtectedRoute>} />
        <Route path="/favorites" element={<ProtectedRoute><Favorites /></ProtectedRoute>} />
        <Route path="/account" element={<ProtectedRoute><Account /></ProtectedRoute>} />

        <Route path="/search" element={<Search />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/movies" element={<MovieExplorer />} />
        <Route path="/nowplaying" element={<NowPlaying />} />

        <Route path="/" element={<Mainpage />} />

      </Routes>
    </>
  )

}

export default App