// src/components/MessageCard.jsx
import React, { useState } from "react";
import "../styles/wall.css";

function MessageCard({ msg, onEdit, onRemove, auth }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(msg.text || msg.content || "");
  const [editMood, setEditMood] = useState((msg.mood || "").toLowerCase());

  const id = msg.id ?? msg.message_id;
  // ✅ auth stores { token, user }, so check auth.user.id
  const isOwner = Boolean(auth?.user?.id) && auth.user.id === msg.user_id;

  // Match backend static route for images (ensure server serves /images)
  const API_URL =
    process.env.REACT_APP_API_URL || "https://kindness-wall-1.onrender.com";

  const handleSave = () => {
    if (!editText.trim()) return;
    onEdit(id, { ...msg, text: editText, mood: editMood });
    setIsEditing(false);
  };

  const moodClass = (msg.mood || "").toLowerCase();
  

  return (
    <div className={`message-card ${moodClass}`}>
      {msg.username && (
        <p className="message-username">
          <strong>{msg.username}</strong>
        </p>
      )}

      {isEditing ? (
        <div className="edit-form">
          <textarea
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
          />
          <select
            value={editMood}
            onChange={(e) => setEditMood(e.target.value)}
          >
            <option value="joy">Joy</option>
            <option value="gratitude">Gratitude</option>
            <option value="hope">Hope</option>
          </select>
          <div className="note-actions">
            <button
              className="edit-btn"
              onClick={handleSave}
              disabled={!editText.trim()}
            >
              Save
            </button>
            <button
              className="remove-btn"
              onClick={() => setIsEditing(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          {msg.image && (
            <div className="message-image">
              <img
                // ✅ If DB stores just filename (e.g. "photo.png")
                src={`${API_URL}${msg.image}`}
                // ✅ If DB stores "/images/photo.png", use instead:
                // src={`${API_URL}${msg.image}`}
                alt="Kindness note"
              />
            </div>
          )}
          <p className="message-text">{msg.text || msg.content}</p>
          {msg.mood && (
            <p className="message-mood">
              <strong>Mood:</strong> {msg.mood}
            </p>
          )}

          {/* 👇 Only show edit/remove if user owns the note */}
          {isOwner && (
            <div className="note-actions">
              <button
                className="edit-btn"
                onClick={() => setIsEditing(true)}
              >
                Edit
              </button>
              <button
                className="remove-btn"
                onClick={() => onRemove(id)}
              >
                Remove
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default MessageCard;