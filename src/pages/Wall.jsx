// src/pages/Wall.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import MessageForm from "../components/MessageForm";
import MessageCard from "../components/MessageCard";
import "../styles/wall.css";

function Wall({ auth }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState("");
  const pageSize = 8;

  // Fetch messages (all or by category)
  const fetchMessages = async () => {
    try {
      setLoading(true);
      const url = filter
        ? `http://localhost:5000/messages/category/${filter}`
        : "http://localhost:5000/messages";

      const res = await axios.get(url);
      setMessages((res.data || []).filter(Boolean));
    } catch (err) {
      console.error("❌ Error fetching messages:", err);
    } finally {
      setLoading(false);
    }
  };

useEffect(() => {
  fetchMessages();
}, [fetchMessages, filter]); 

  // Add a new message
  const addMessage = async ({ text, mood, image }) => {
    if (!auth || !auth.id) {
      console.error("❌ No auth user available");
      return;
    }

    const formData = new FormData();
    formData.append("user_id", auth.id);
    formData.append("text", text);
    formData.append("mood", mood);
    if (image) formData.append("image", image);

    try {
      await axios.post("http://localhost:5000/messages", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      fetchMessages();
      setPage(1);
    } catch (err) {
      console.error("❌ Error adding message:", err.response?.data || err);
    }
  };

  // Remove a message
  const removeMessage = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/messages/${id}`);
      fetchMessages();
    } catch (err) {
      console.error("❌ Error removing message:", err.response?.data || err);
    }
  };

  // Edit a message
  const editMessage = async (id, updatedMsg) => {
    try {
      await axios.put(`http://localhost:5000/messages/${id}`, updatedMsg);
      fetchMessages();
    } catch (err) {
      console.error("❌ Error editing message:", err.response?.data || err);
    }
  };

  // Pagination
  const total = messages.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const startIndex = (page - 1) * pageSize;
  const currentMessages = messages.slice(startIndex, startIndex + pageSize);

  return (
    <div className="wall-wrapper">
      <div className="wall-page">
        <h2 className="wall-title">🌸 Kindness Wall 🌸</h2>

        <MessageForm onAdd={addMessage} />

        <div className="filter-bar">
          <label htmlFor="category">Filter by category: </label>
          <select
            id="category"
            value={filter}
            onChange={(e) => {
              setFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All</option>
            <option value="Joy">Joy</option>
            <option value="Gratitude">Gratitude</option>
            <option value="Hope">Hope</option>
          </select>
        </div>

        {loading && <p>Loading messages...</p>}

        <div className="grid">
          {currentMessages.length === 0 ? (
            <p>No messages yet. Be the first to post!</p>
          ) : (
            currentMessages.map((msg) => (
              <MessageCard
                key={msg.id || msg.message_id}
                msg={msg}
                onEdit={editMessage}
                onRemove={removeMessage}
                auth={auth} // 👈 pass auth down
              />
            ))
          )}
        </div>

        <div className="pagination">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </button>
          <span>
            Page {page} of {totalPages}
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

export default Wall;