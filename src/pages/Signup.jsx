// src/pages/Signup.jsx
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/Signup.css";

function Signup({ setAuth }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");
  const navigate = useNavigate();

  // ✅ Base API URL (Render backend or environment variable)
  const API_URL = process.env.REACT_APP_API_URL || "https://kindness-wall-1.onrender.com";

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username || !email || !password) {
      alert("All fields are required.");
      return;
    }

    try {
      // ✅ Use API_URL instead of localhost
      const res = await axios.post(`${API_URL}/signup`, {
        username,
        email,
        password,
      });

      console.log("✅ Signup response:", res.data);
      setStatus("Signup successful!");

      // Immediately log in new user
      setAuth({ id: res.data.id, username, email });
      navigate("/"); // redirect to Wall
    } catch (err) {
      console.error("❌ Signup error:", err.response?.data || err.message);
      setStatus(err.response?.data?.error || "Signup failed.");
    }
  };

  return (
    <div className="signup-page">
      <form onSubmit={handleSubmit} className="signup-form">
        <h2>Signup 🌸</h2>

        <input
          type="text"
          placeholder="Enter your username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button type="submit">Signup</button>
        <p>{status}</p>

        <p>
          Already have an account?{" "}
          <span
            style={{ color: "blue", cursor: "pointer", textDecoration: "underline" }}
            onClick={() => navigate("/login")}
          >
            Login
          </span>
        </p>
      </form>
    </div>
  );
}

export default Signup;