// src/pages/Login.jsx
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/Login.css";

function Login({ setAuth }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // ✅ Base API URL (Render backend or environment variable)
  const API_URL = process.env.REACT_APP_API_URL || "https://kindness-wall-1.onrender.com";

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      alert("Please enter both email and password.");
      return;
    }

    try {
      // ✅ Use API_URL instead of localhost
      const res = await axios.post(`${API_URL}/login`, {
        email,
        password,
      });

      // Save token for authenticated requests
      localStorage.setItem("token", res.data.token);

      // Set auth state with user info
      setAuth(res.data.user);

      // Redirect to Wall
      navigate("/");
    } catch (err) {
      console.error("❌ Login error:", err.response?.data || err.message);

      // Show backend error if available, else generic message
      setError(err.response?.data?.error || "Wrong username or password");
    }
  };

  return (
    <div className="login-page">
      <form onSubmit={handleSubmit} className="login-form">
        <h2>Login 🌸</h2>

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

        <button type="submit">Login</button>

        {/* ✅ Error message above signup prompt */}
        {error && <p className="error">{error}</p>}

        {/* ✅ Signup prompt always visible */}
        <p>
          Don’t have an account?{" "}
          <span
            style={{ color: "blue", cursor: "pointer", textDecoration: "underline" }}
            onClick={() => navigate("/signup")}
          >
            Signup
          </span>
        </p>
      </form>
    </div>
  );
}

export default Login;