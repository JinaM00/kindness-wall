// src/components/MessageCard.jsx
import React, { useState } from "react";
import "../styles/wall.css";

function MessageCard({ msg, onEdit, onRemove, auth }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(msg.text || msg.content || "");
  const [editMood, setEditMood] = useState(msg.mood || "");

  const id = msg.id || msg.message_id;
  const isOwner = auth && auth.id === msg.user_id; // 👈 check ownership

  const API_URL = process.env.REACT_APP_API_URL || "https://kindness-wall-1.onrender.com";

  const handleSave = () => {
    onEdit(id, { ...msg, text: editText, mood: editMood });
    setIsEditing(false);
  };

  return (
    <div className={`message-card ${msg.mood?.toLowerCase()}`}>
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
            <button className="edit-btn" onClick={handleSave}>
              Save
            </button>
            <button className="remove-btn" onClick={() => setIsEditing(false)}>
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          {msg.image && (
            <div className="message-image">
              <img
                src={`${API_URL}/images/${msg.image}`}
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
              <button className="edit-btn" onClick={() => setIsEditing(true)}>
                Edit
              </button>
              <button className="remove-btn" onClick={() => onRemove(id)}>
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