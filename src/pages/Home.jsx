// src/pages/Home.jsx
// src/pages/Home.jsx
// src/pages/Home.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import messages from "../data/messages";
import "../styles/Home.css";
import bgImage from "../assets/background.jpg"; // ✅ import background image

function Home() {
  const [featured, setFeatured] = useState("");

  useEffect(() => {
    const idx = Math.floor(Math.random() * messages.length);
    setFeatured(messages[idx].text);
  }, []);

  return (
    <div
      className="home-page"
      style={{
        backgroundImage: `url(${bgImage})`, // ✅ safe background
        backgroundSize: "cover",
        backgroundPosition: "center",
        minHeight: "100vh"
      }}
    >
      <div className="home-content">
        {/* Hero section at the top under navbar */}
        <section className="hero">
          <h1 className="hero-title">Welcome to Kindness Wall 🌸</h1>
          <p>Share and receive uplifting messages</p>
          <Link to="/wall" className="cta-button">Visit the Wall</Link>
        </section>

        {/* Featured kindness message */}
        <section className="featured">
          <h2>Featured Kindness! 💌</h2>
          <div className="featured-card">
            {featured}
          </div>
        </section>
      </div>
    </div>
  );
}

export default Home;