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

  // ✅ Load user from localStorage when app starts
  useEffect(() => {
    const savedAuth = localStorage.getItem("auth");
    if (savedAuth) {
      setAuth(JSON.parse(savedAuth)); // stored as { id, username, email }
    }
  }, []);

  const handleLogin = (userObj) => {
    // userObj should be { id, username, email } from backend
    setAuth(userObj);
    localStorage.setItem("auth", JSON.stringify(userObj));
  };

  const handleLogout = () => {
    setAuth(null);
    localStorage.removeItem("auth");
  };

  return (
    <Router>
      <div className="App">
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