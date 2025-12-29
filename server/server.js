const express = require("express");
const mysql = require("mysql2/promise");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Load .env in local dev
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const app = express();
app.use(express.json());

/* -------------------- CORS -------------------- */
app.use(
  cors({
    origin: [
      "http://localhost:3000",             // local dev
      "https://kindness-wall.netlify.app", // Netlify frontend
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

/* -------------------- Static images -------------------- */
// Ensure uploads folder exists
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

// Serve uploaded images under /uploads (matches frontend)
app.use("/uploads", express.static(uploadsDir));

/* -------------------- Multer -------------------- */
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path
      .basename(file.originalname, ext)
      .replace(/\s+/g, "_")
      .toLowerCase();
    cb(null, `${base}_${Date.now()}${ext}`);
  },
});
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only image uploads are allowed"));
  },
});

/* -------------------- DB init -------------------- */
let db;

async function initDB() {
  try {
    db = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "KindnessWall",
      port: process.env.DB_PORT || 3306,
    });
    console.log("✅ Connected to MySQL database");
  } catch (err) {
    console.error("❌ DB connection failed:", err.message);
    process.exit(1);
  }
}
initDB();

/* -------------------- Auth -------------------- */
// Signup
app.post("/signup", async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: "All fields required" });
  }
  if (password.length < 6) {
    return res
      .status(400)
      .json({ error: "Password must be at least 6 characters long" });
  }

  try {
    const hashed = await bcrypt.hash(password, 10);
    const [result] = await db.query(
      "INSERT INTO users (username, email, password, created_at) VALUES (?,?,?,NOW())",
      [username, email, hashed]
    );

    // Optional: auto-login on signup
    const safeUser = { id: result.insertId, username, email };
    const token = jwt.sign(
      { id: safeUser.id, username: safeUser.username },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ success: true, id: result.insertId, token, user: safeUser });
  } catch (err) {
    console.error("❌ Signup error:", err);
    if (err.code === "ER_DUP_ENTRY" && err.sqlMessage.includes("email")) {
      return res.status(400).json({ error: "Email already registered" });
    }
    if (err.code === "ER_DUP_ENTRY" && err.sqlMessage.includes("username")) {
      return res.status(400).json({ error: "Username already taken" });
    }
    return res
      .status(500)
      .json({ error: "Database error", details: err.message });
  }
});

// Login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    if (rows.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Strip password before sending to client
    const { password: _, ...safeUser } = user;
    res.json({ token, user: safeUser });
  } catch (err) {
    console.error("❌ Login error:", err);
    res.status(500).json({ error: "DB error", details: err.message });
  }
});

/* -------------------- Messages CRUD -------------------- */
// Get all messages
app.get("/messages", async (req, res) => {
  try {
    const [rows] = await db.query(
      `
      SELECT m.id, m.user_id, m.text, m.mood, m.image, m.created_at, u.username
      FROM messages m
      JOIN users u ON m.user_id = u.id
      ORDER BY m.created_at DESC
    `
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "DB error", details: err.message });
  }
});

// Get by category (expects lowercase: joy, gratitude, hope)
app.get("/messages/category/:category", async (req, res) => {
  const category = (req.params.category || "").toLowerCase();
  try {
    const [rows] = await db.query(
      `
      SELECT m.id, m.user_id, m.text, m.mood, m.image, m.created_at, u.username
      FROM messages m
      JOIN users u ON m.user_id = u.id
      WHERE LOWER(m.mood) = ?
      ORDER BY m.created_at DESC
    `,
      [category]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "DB error", details: err.message });
  }
});

// Post a new message
app.post("/messages", upload.single("image"), async (req, res) => {
  const { text, mood } = req.body;
  const image = req.file ? req.file.filename : null;

  // Basic validation
  if (!text || !text.trim()) {
    return res.status(400).json({ error: "Text is required" });
  }

  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    return res.status(401).json({ error: "Missing Authorization header" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    if (!userId) {
      return res.status(401).json({ error: "Invalid token: missing user ID" });
    }

    // Insert without created_at (DB auto-fills CURRENT_TIMESTAMP)
    const [result] = await db.query(
      "INSERT INTO messages (user_id, text, mood, image) VALUES (?,?,?,?)",
      [userId, text.trim(), mood || null, image]
    );

    res.json({ success: true, id: result.insertId });
  } catch (err) {
    console.error("❌ Message error:", err);
    // Multer/file errors surface here too
    res.status(500).json({ error: "Database error", details: err.message });
  }
});

// Update a message (text/mood only; extend to image if needed)
app.put("/messages/:id", async (req, res) => {
  const id = req.params.id;
  const { text, mood } = req.body;

  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    return res.status(401).json({ error: "Missing Authorization header" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    // Ownership check (only author can edit)
    const [rows] = await db.query("SELECT user_id FROM messages WHERE id = ?", [
      id,
    ]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Message not found" });
    }
    if (rows[0].user_id !== userId) {
      return res.status(403).json({ error: "Not allowed to edit this message" });
    }

    await db.query("UPDATE messages SET text = ?, mood = ? WHERE id = ?", [
      text?.trim() || "",
      mood || null,
      id,
    ]);
    res.json({ success: true });
  } catch (err) {
    console.error("❌ Edit error:", err);
    res.status(500).json({ error: "Database error", details: err.message });
  }
});

// Delete a message
app.delete("/messages/:id", async (req, res) => {
  const id = req.params.id;

  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    return res.status(401).json({ error: "Missing Authorization header" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    const [rows] = await db.query("SELECT user_id, image FROM messages WHERE id = ?", [
      id,
    ]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Message not found" });
    }
    if (rows[0].user_id !== userId) {
      return res.status(403).json({ error: "Not allowed to delete this message" });
    }

    // Remove image file if present
    if (rows[0].image) {
      const filePath = path.join(uploadsDir, rows[0].image);
      fs.existsSync(filePath) && fs.unlinkSync(filePath);
    }

    await db.query("DELETE FROM messages WHERE id = ?", [id]);
    res.json({ success: true });
  } catch (err) {
    console.error("❌ Delete error:", err);
    res.status(500).json({ error: "Database error", details: err.message });
  }
});

/* -------------------- Liftup prompts -------------------- */
let currentPrompt = null;

async function updatePrompt() {
  try {
    const [rows] = await db.query(
      "SELECT id, text, emoji FROM liftup_messages ORDER BY RAND() LIMIT 1"
    );
    if (rows.length > 0) {
      currentPrompt = rows[0];
      console.log("✨ Updated prompt:", currentPrompt);
    }
  } catch (err) {
    console.error("❌ Error fetching prompt:", err);
  }
}
setInterval(updatePrompt, 15000);

app.get("/current_prompt", (req, res) => {
  if (currentPrompt) res.json(currentPrompt);
  else res.json({ message: "No prompt yet" });
});

app.get("/liftup/random", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT id, text, emoji FROM liftup_messages ORDER BY RAND() LIMIT 1"
    );
    if (rows.length > 0) res.json(rows[0]);
    else res.status(404).json({ error: "No featured kindness available" });
  } catch (err) {
    console.error("❌ Error fetching featured kindness:", err);
    res.status(500).json({ error: "Database error", details: err.message });
  }
});

// ⚠️ TEMPORARY ROUTE — remove after running once
app.get("/drop-pk", async (req, res) => {
  try {
    await db.query("ALTER TABLE users DROP PRIMARY KEY");
    res.json({ success: true, message: "Primary key dropped from users table" });
  } catch (err) {
    console.error("❌ Drop PK error:", err);
    res.status(500).json({ error: "Failed to drop primary key", details: err.message });
  }
});
/* -------------------- Start server -------------------- */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`);
});