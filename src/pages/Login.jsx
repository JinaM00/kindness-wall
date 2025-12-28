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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      alert("Please enter both email and password.");
      return;
    }

    try {
      const res = await axios.post("http://localhost:5000/login", {
        email,
        password
      });

      localStorage.setItem("token", res.data.token);
      setAuth(res.data.user);
      navigate("/"); // go to Wall
    } catch (err) {
      console.error("❌ Login error:", err.response?.data || err.message);

      // Show wrong username/password message
      setError("Wrong username or password");
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