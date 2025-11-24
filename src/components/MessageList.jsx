import React from "react";
import MessageCard from "./MessageCard";

function MessageList({ items }) {
  return (
    <div className="grid">
      {items.map(item => (
        <div key={item.id} className={`new-note ${item.mood.toLowerCase()}`}>
          {item.text}
        </div>
      ))}
    </div>
  );
}

export default MessageList;
