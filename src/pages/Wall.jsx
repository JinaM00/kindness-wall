import React, { useState } from "react";
import messagesData from "../data/messages";
import MessageForm from "../components/MessageForm";
import MessageList from "../components/MessageList";
import "../styles/Wall.css";
import bgImage from "../assets/background.jpg"; // ✅ import background

function Wall() {
  const [messages, setMessages] = useState(messagesData);
  const [filter, setFilter] = useState("All");
  const [popupMsg, setPopupMsg] = useState(null);
  const [page, setPage] = useState(0);
  const notesPerPage = 6;

  const addMessage = ({ text, mood }) => {
    const newMsg = { id: Date.now(), text, mood };
    setMessages(prev => [newMsg, ...prev]);
    setPage(0);
  };

  const filtered = messages.filter(m =>
    filter === "All" ? true : m.mood === filter
  );

  const start = page * notesPerPage;
  const paginated = filtered.slice(start, start + notesPerPage);

  const randomUplift = () => {
    if (messages.length === 0) return;
    const idx = Math.floor(Math.random() * messages.length);
    setPopupMsg(messages[idx]);
  };

  return (
    <div
      className="wall-wrapper"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        minHeight: "100vh"
      }}
    >
      <div className="wall-page">
        <h2>🌸 Kindness Wall 🌸</h2>
        <MessageForm onAdd={addMessage} />

        <div className="controls">
          <button onClick={() => setFilter("All")}>All</button>
          <button onClick={() => setFilter("Joy")}>Joy</button>
          <button onClick={() => setFilter("Gratitude")}>Gratitude</button>
          <button onClick={() => setFilter("Hope")}>Hope</button>
          <button onClick={randomUplift}>🎲 Random Uplift</button>
        </div>

        <MessageList items={paginated} />

        <div className="pagination">
          <button disabled={page === 0} onClick={() => setPage(page - 1)}>
            ⬅ Previous
          </button>
          <button
            disabled={start + notesPerPage >= filtered.length}
            onClick={() => setPage(page + 1)}
          >
            Next ➡
          </button>
        </div>

        {popupMsg && (
          <div className={`popup-note ${popupMsg.mood.toLowerCase()}`}>
            <p>{popupMsg.text}</p>
            <button onClick={() => setPopupMsg(null)}>✖ Close</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Wall;