// src/App.jsx
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import NavBar from "./components/NavBar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import About from "./pages/About";
import Features from "./pages/Features";
import Wall from "./pages/Wall";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import AddMessage from "./AddMessage";

function App() {
  const [auth, setAuth] = useState(null);

  // ✅ Restore auth (token + user) from localStorage when app starts
  useEffect(() => {
    const savedAuth = localStorage.getItem("auth");
    if (savedAuth) {
      setAuth(JSON.parse(savedAuth)); // stored as { token, user }
    }
  }, []);

  // ✅ Handle login: store token + user together
  const handleLogin = (authData) => {
    // authData should be { token, user } from backend
    setAuth(authData);
    localStorage.setItem("auth", JSON.stringify(authData));
  };

  // ✅ Handle logout: clear state + localStorage
  const handleLogout = () => {
    setAuth(null);
    localStorage.removeItem("auth");
  };

  return (
    <Router>
      <div className="App">
        {/* ✅ Pass auth + logout to NavBar so it can show user info and logout button */}
        <NavBar auth={auth} onLogout={handleLogout} />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/features" element={<Features />} />
          <Route path="/wall" element={<Wall auth={auth} />} />
          <Route path="/login" element={<Login setAuth={handleLogin} />} />
          <Route path="/signup" element={<Signup setAuth={handleLogin} />} />
          <Route path="/add" element={<AddMessage auth={auth} />} />
        </Routes>

        <Footer />
      </div>
    </Router>
  );
}

export default App;