// src/pages/Wall.jsx
import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import MessageForm from "../components/MessageForm";
import MessageCard from "../components/MessageCard";
import "../styles/wall.css";

// Use environment variable if available, fallback to Render URL
const API_URL =
  process.env.REACT_APP_API_URL || "https://kindness-wall-1.onrender.com";

function Wall({ auth }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState("");
  const [postError, setPostError] = useState("");
  const pageSize = 8;

  // ✅ Fetch messages
  const fetchMessages = useCallback(async () => {
    try {
      setLoading(true);
      const url = filter
        ? `${API_URL}/messages/category/${filter.toLowerCase()}`
        : `${API_URL}/messages`;

      const res = await axios.get(url);

      // Normalize image URLs so they point to backend /images
      const normalized = (res.data || []).filter(Boolean).map((msg) => ({
      ...msg,
      image: msg.image
      ? msg.image.startsWith("/images/")
      ? `${API_URL}${msg.image}`        // already has /images
      : `${API_URL}/images/${msg.image}` // just filename
      : null,
      }));

      setMessages(normalized);
    } catch (err) {
      console.error("❌ Error fetching messages:", err.response?.data || err);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // ✅ Add a new message
  const addMessage = async ({ text, mood, image }) => {
    if (!auth || !auth.token) {
      setPostError("❌ Please login first to post a message");
      return;
    }

    const formData = new FormData();
    formData.append("text", text);
    formData.append("mood", mood);
    if (image) formData.append("image", image);

    try {
      const response = await axios.post(`${API_URL}/messages`, formData, {
        headers: {
          
          Authorization: `Bearer ${auth.token}`,
        },
        
      });
       // ✅ Debug log to confirm what backend returns
      console.log("Upload response:", response.data);


      setPostError("");
      fetchMessages();
      setPage(1);
    } catch (err) {
      console.error("❌ Error adding message:", err.response?.data || err.message);
      setPostError(err.response?.data?.error || "Failed to post message");
    }
  };

  // ✅ Remove a message
  const removeMessage = async (id) => {
    if (!auth || !auth.token) {
      setPostError("❌ Please login first to remove a message");
      return;
    }

    try {
      await axios.delete(`${API_URL}/messages/${id}`, {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      });
      fetchMessages();
    } catch (err) {
      console.error("❌ Error removing message:", err.response?.data || err);
      setPostError(err.response?.data?.error || "Failed to remove message");
    }
  };

  // ✅ Edit a message
  const editMessage = async (id, updatedMsg) => {
    if (!auth || !auth.token) {
      setPostError("❌ Please login first to edit a message");
      return;
    }

    try {
      await axios.put(`${API_URL}/messages/${id}`, updatedMsg, {
        headers: {
          Authorization: `Bearer ${auth.token}`,
          "Content-Type": "application/json",
        },
      });
      fetchMessages();
    } catch (err) {
      console.error("❌ Error editing message:", err.response?.data || err);
      setPostError(err.response?.data?.error || "Failed to edit message");
    }
  };

  // ✅ Pagination
  const total = messages.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const startIndex = (page - 1) * pageSize;
  const currentMessages = messages.slice(startIndex, startIndex + pageSize);

  return (
    <div className="wall-wrapper">
      <div className="wall-page">
        <h2 className="wall-title">🌸 Kindness Wall 🌸</h2>

        {/* ✅ Show error messages */}
        {postError && <p className="error-text">{postError}</p>}

        <MessageForm onAdd={addMessage} />

        <div className="filter-bar">
          <label htmlFor="category">Filter by category: </label>
          <select
            id="category"
            name="category"
            value={filter}
            onChange={(e) => {
              setFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All</option>
            <option value="joy">Joy</option>
            <option value="gratitude">Gratitude</option>
            <option value="hope">Hope</option>
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
                auth={auth}
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