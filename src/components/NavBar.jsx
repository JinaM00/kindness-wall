import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/NavBar.css";
import logo from "../assets/logo.png"; // transparent PNG logo

function NavBar({ user, onLogout }) {
  const [isOpen, setIsOpen] = useState(false);
  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <nav className="navbar">
      {/* ✅ Logo stays on the left */}
      <Link to="/" className="logo">
        <img src={logo} alt="Kindness Wall Logo" />
      </Link>

      {/* ✅ Hamburger only shows when menu is closed */}
      {!isOpen && (
        <button className="menu-icon" onClick={toggleMenu}>☰</button>
      )}

      {/* ✅ Links centered */}
      <ul className={`nav-links ${isOpen ? "open" : ""}`}>
        <li><Link to="/">Home</Link></li>
        <li><Link to="/about">About</Link></li>
        <li><Link to="/features">Features</Link></li>
        <li><Link to="/wall">Wall</Link></li>

        {!user ? (
          <li><Link to="/login">Login</Link></li>
        ) : (
          <>
            <li className="welcome-text">
              Welcome, {user.username || user.email} 🌸
            </li>
            <li>
              <button className="logout-btn" onClick={onLogout}>Logout</button>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
}

export default NavBar;