// src/components/Footer.jsx
import React from "react";
import { FaGithub } from "react-icons/fa";   // GitHub icon
import { MdEmail } from "react-icons/md";    // Email icon
import "../styles/Footer.css";

function Footer() {
  return (
    <footer className="footer">
      <p className="footer-text">© 2025 Kindness Wall. Made with 💖 by Ji.</p>
      <div className="social-links">
        <a href="https://github.com/yourusername" target="_blank" rel="noreferrer">
          <FaGithub size={24} />
        </a>
        <a href="mailto:youremail@example.com">
          <MdEmail size={24} />
        </a>
      </div>
    </footer>
  );
}

export default Footer;