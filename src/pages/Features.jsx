// src/pages/Features.jsx
import React from "react";
import features from "../data/features";   // your features data
import FeatureCard from "../components/FeatureCard"; // reusable card component
import "../styles/Features.css";

function Features() {
  return (
    <div className="features-page">
      <h2 className="features-title">✨ Features of Kindness Wall ✨</h2>
      <div className="features-grid">
        {features.map((feature) => (
          <FeatureCard 
            key={feature.id} 
            title={feature.title} 
            desc={feature.desc} 
          />
        ))}
      </div>
    </div>
  );
}

export default Features;