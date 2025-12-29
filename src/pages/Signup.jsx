// src/pages/Signup.jsx
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/Signup.css";

const API_URL =
  process.env.REACT_APP_API_URL || "https://kindness-wall-1.onrender.com";

function Signup({ setAuth }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username || !email || !password) {
      alert("All fields are required.");
      return;
    }

    try {
      const res = await axios.post(`${API_URL}/signup`, {
        username,
        email,
        password,
      });

      // ✅ Save { token, user } in state + localStorage
      const authData = { token: res.data.token, user: res.data.user };
      setAuth(authData);
      localStorage.setItem("auth", JSON.stringify(authData));

      navigate("/wall");
    } catch (err) {
      console.error("❌ Signup error:", err.response?.data || err.message);
      setError(err.response?.data?.error || "Signup failed.");
    }
  };

  return (
    <div className="signup-page">
      <form onSubmit={handleSubmit} className="signup-form">
        <h2>Signup 🌸</h2>

        <input
          type="text"
          id="signup-username"
          name="username"
          placeholder="Enter your username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          type="email"
          id="signup-email"
          name="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          id="signup-password"
          name="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button type="submit">Signup</button>
        {error && <p className="error">{error}</p>}

        <p>
          Already have an account?{" "}
          <span
            style={{
              color: "blue",
              cursor: "pointer",
              textDecoration: "underline",
            }}
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