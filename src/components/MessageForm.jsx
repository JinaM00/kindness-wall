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

    if (!text.trim()) {
      alert("Please enter a kindness note before posting.");
      return;
    }

    onAdd({ text, mood, image });

    // ✅ Reset form
    setText("");
    setMood("joy");
    setImage(null);

    // ✅ Clear file input
    document.getElementById("fileInput").value = "";
  };

  return (
    <form className="message-form-simple" onSubmit={handleSubmit}>
      <textarea
        id="message-text"
        name="text"                // ✅ added name
        placeholder="Write your kindness note..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <select
        id="message-mood"
        name="mood"                // ✅ added name
        value={mood}
        onChange={(e) => setMood(e.target.value)}
      >
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
          name="image"             // ✅ added name
          type="file"
          className="file-input"
          accept="image/*"
          onChange={handleFileChange}
        />
      </div>

      <button type="submit">Post</button>
    </form>
  );
}

export default MessageForm;