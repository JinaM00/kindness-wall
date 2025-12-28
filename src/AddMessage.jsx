// src/pages/AddMessage.jsx
import axios from "axios";
import { useState } from "react";

function AddMessage({ auth, onAdd }) {
  const [text, setText] = useState("");
  const [mood, setMood] = useState("Joy");
  const [image, setImage] = useState(null);
  const [status, setStatus] = useState("");

 const handleSubmit = async (e) => {
  e.preventDefault();
  setStatus("Saving...");

  const formData = new FormData();
  formData.append("user_id", auth?.id || 1);
  formData.append("text", text);
  formData.append("mood", mood);
  if (image) formData.append("image", image);

  try {
    const res = await axios.post("http://localhost:5000/messages", formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });
    console.log("✅ Posted message response:", res.data);
    setStatus("Saved!");
    setText("");
    setMood("Joy");
    setImage(null);

    if (onAdd) onAdd(); // refresh wall if callback provided
  } catch (err) {
    console.error("❌ Error saving message:", err.response?.data || err.message);
    setStatus("Error saving message");
  }
};

  return (
    <div style={{ padding: 16 }}>
      <h2>Add a kindness note</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write kindness..."
            required
          />
        </div>
        <div>
          <select value={mood} onChange={(e) => setMood(e.target.value)}>
            <option>Joy</option>
            <option>Gratitude</option>
            <option>Hope</option>
          </select>
        </div>
        <div>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files[0])}
          />
        </div>
        <button type="submit">Add Message</button>
      </form>
      <p>{status}</p>
    </div>
  );
}

export default AddMessage;