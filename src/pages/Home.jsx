import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "../styles/Home.css";
import bgImage from "../assets/background.jpg";

function Home() {
  const [featured, setFeatured] = useState("");
  const [error, setError] = useState(null);

  // function to fetch a random kindness message
  const fetchFeatured = async () => {
    try {
      const res = await axios.get("http://localhost:5000/liftup/random");
      setFeatured(`${res.data.emoji || ""} ${res.data.text}`);
      setError(null);
    } catch (err) {
      console.error("❌ Error fetching featured message:", err);
      setError("Could not load featured kindness. ✨");
    }
  };

  useEffect(() => {
    // fetch immediately on mount
    fetchFeatured();

    // then refresh every 15 seconds
    const interval = setInterval(fetchFeatured, 15000);

    // cleanup when component unmounts
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="home-page"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        minHeight: "100vh"
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