// src/components/MessageForm.jsx
import React, { useState } from "react";
import "../styles/MessageForm.css";

function MessageForm({ onAdd }) {
  const [text, setText] = useState("");
  const [mood, setMood] = useState("joy");
  const [image, setImage] = useState(null);

  const handleFileChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd({ text, mood, image });
    setText("");
    setMood("joy");
    setImage(null);
  };

  return (
    <form className="message-form-simple" onSubmit={handleSubmit}>
      <textarea
        placeholder="Write your kindness note..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <select value={mood} onChange={(e) => setMood(e.target.value)}>
        <option value="joy">Joy</option>
        <option value="gratitude">Gratitude</option>
        <option value="hope">Hope</option>
      </select>

      {/* 👇 Custom file upload box */}
      <div className="file-upload">
        <label htmlFor="fileInput" className="custom-file-label">
          📎 Choose Image
        </label>
        <input
          id="fileInput"
          type="file"
          className="file-input"
          onChange={handleFileChange}
        />
      </div>

      <button type="submit">Post</button>
    </form>
  );
}

export default MessageForm;