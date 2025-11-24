import React from "react";
import "../styles/Wall.css"; // make sure to import your CSS

function MessageCard({ text, mood }) {
  // Convert mood to lowercase so it matches CSS classes (.joy, .gratitude, .hope)
  const moodClass = mood ? mood.toLowerCase() : "";

  return (
    <div className={`message-card ${moodClass}`}>
      <p>{text}</p>
      <small>Mood: {mood}</small>
    </div>
  );
}

export default MessageCard;