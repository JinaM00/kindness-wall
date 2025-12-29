// src/pages/Home.jsx
import { Link } from "react-router-dom";
import axios from "axios";
import "../styles/Home.css";
import bgImage from "../assets/background.jpg";
import React, { useState, useEffect, useCallback } from "react";


function Home() {
  const [featured, setFeatured] = useState("");
  const [error, setError] = useState(null);

  // ✅ Base API URL (Render backend or environment variable)
  const API_URL = process.env.REACT_APP_API_URL || "https://kindness-wall-1.onrender.com";

  // function to fetch a random kindness message
const fetchFeatured = useCallback(async () => {
  try {
    const res = await axios.get(`${API_URL}/liftup/random`);
    setFeatured(`${res.data.emoji || ""} ${res.data.text}`);
    setError(null);
  } catch (err) {
    console.error("❌ Error fetching featured message:", err);
    setError("Could not load featured kindness. ✨");
  }
}, [API_URL]);

useEffect(() => {
  fetchFeatured();
  const interval = setInterval(fetchFeatured, 15000);
  return () => clearInterval(interval);
}, [fetchFeatured]); // ✅ now safe

  return (
    <div
      className="home-page"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        minHeight: "100vh",
      }}
    >
      <div className="home-content">
        {/* Hero section */}
        <section className="hero">
          <h1 className="hero-title">Welcome to Kindness Wall 🌸</h1>
          <p>Share and receive uplifting messages</p>
          <Link to="/wall" className="cta-button">Visit the Wall</Link>
        </section>

        {/* Featured kindness message */}
        <section className="featured">
          <h2>Featured Kindness! 💌</h2>
          <div className="featured-card">
            {error ? error : featured || "Loading..."}
          </div>
        </section>
      </div>
    </div>
  );
}

export default Home;