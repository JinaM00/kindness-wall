// src/components/FeatureCard.jsx
import React from "react";
import "../styles/FeatureCard.css";

function FeatureCard({ title, desc }) {
  return (
    <div className="feature-card">
      <h3>{title}</h3>
      <p>{desc}</p>
    </div>
  );
}

export default FeatureCard;
