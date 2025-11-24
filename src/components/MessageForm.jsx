import React, { useState } from "react";

function MessageForm({ onAdd }) {
  const [form, setForm] = useState({ text: "", mood: "Joy" });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.text.trim()) return;
    onAdd(form);
    setForm({ text: "", mood: "Joy" });
  };

  return (
    <form onSubmit={handleSubmit} className="message-form">
      <textarea
        name="text"
        rows="3"
        placeholder="Write a kind note… 😊"
        value={form.text}
        onChange={handleChange}
      />
      <select name="mood" value={form.mood} onChange={handleChange}>
        <option>Joy</option>
        <option>Gratitude</option>
        <option>Hope</option>
      </select>
      <button type="submit">Post</button>
    </form>
  );
}
export default MessageForm;