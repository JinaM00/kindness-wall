// src/components/MessageList.jsx
import React from "react";
import MessageCard from "./MessageCard";

function MessageList({ items, onRemove, onEdit }) {
  return (
    <div className="grid">
      {items.map(item => (
        <MessageCard
          key={item.id}
          id={item.id}
          text={item.text}
          mood={item.mood}
          onRemove={onRemove}
          onEdit={onEdit}
        />
      ))}
    </div>
  );
}

export default MessageList;