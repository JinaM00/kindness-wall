const express = require("express");
const mysql = require("mysql2/promise"); // ✅ use promise wrapper
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();
app.use(cors());
app.use(express.json());

// Serve uploaded images
app.use("/images", express.static("images"));

// Ensure images folder exists
if (!fs.existsSync("images")) fs.mkdirSync("images");

// Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "images/"),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/\s+/g, "_");
    cb(null, `${base}_${Date.now()}${ext}`);
  },
});
const upload = multer({ storage });

/* -------------------- INIT + DB -------------------- */
async function init() {
  // ✅ create promise connection
const db = await mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
});


  console.log("✅ Connected to MySQL database");

  /* -------------------- AUTH -------------------- */

  // Signup
// Signup
app.post("/signup", async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: "All fields required" });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters long" });
  }

  try {
    const hashed = await bcrypt.hash(password, 10);
    const [result] = await db.query(
      "INSERT INTO users (username, email, password) VALUES (?,?,?)",
      [username, email, hashed]
    );

    res.json({ success: true, id: result.insertId });
  } catch (err) {
    console.error("❌ Signup error:", err);

    if (err.code === "ER_DUP_ENTRY" && err.sqlMessage.includes("email")) {
      return res.status(400).json({ error: "Email already registered" });
    }

    if (err.code === "ER_DUP_ENTRY" && err.sqlMessage.includes("username")) {
      return res.status(400).json({ error: "Username already taken" });
    }

    return res.status(500).json({ error: "Database error", details: err.message });
  }
}); // ✅ this closes the route correctly
  // Login
  app.post("/login", async (req, res) => {
    const { email, password } = req.body;
    try {
      const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
      if (rows.length === 0) return res.status(401).json({ error: "Invalid credentials" });

      const user = rows[0];
      const match = await bcrypt.compare(password, user.password);
      if (!match) return res.status(401).json({ error: "Invalid credentials" });

      const token = jwt.sign({ id: user.id, username: user.username }, "secretkey");
      res.json({ token, user });
    } catch (err) {
      res.status(500).json({ error: "DB error", details: err });
    }
  });

  /* -------------------- MESSAGES CRUD -------------------- */

  // Get all messages
  app.get("/messages", async (req, res) => {
    try {
      const [rows] = await db.query(`
        SELECT m.id, m.user_id, m.text, m.mood, m.image, m.created_at, u.username
        FROM messages m
        JOIN users u ON m.user_id = u.id
        ORDER BY m.created_at DESC
      `);
      res.json(rows);
    } catch (err) {
      res.status(500).json({ error: "DB error", details: err });
    }
  });

  // Get single message
  app.get("/messages/:id", async (req, res) => {
    try {
      const [rows] = await db.query(`
        SELECT m.id, m.user_id, m.text, m.mood, m.image, m.created_at, u.username
        FROM messages m
        JOIN users u ON m.user_id = u.id
        WHERE m.id = ?
      `, [req.params.id]);
      if (rows.length === 0) return res.status(404).json({ error: "Not found" });
      res.json(rows[0]);
    } catch (err) {
      res.status(500).json({ error: "DB error", details: err });
    }
  });

  // Create message
  app.post("/messages", upload.single("image"), async (req, res) => {
    const { user_id, text, mood } = req.body;
    const image = req.file ? req.file.filename : null;
    if (!user_id || !text || !mood) {
      return res.status(400).json({ error: "user_id, text, mood required" });
    }
    try {
      const [result] = await db.query(
        "INSERT INTO messages (user_id, text, mood, image) VALUES (?,?,?,?)",
        [user_id, text, mood, image]
      );
      const [rows] = await db.query(`
        SELECT m.id, m.user_id, m.text, m.mood, m.image, m.created_at, u.username
        FROM messages m
        JOIN users u ON m.user_id = u.id
        WHERE m.id = ?
      `, [result.insertId]);
      res.status(201).json(rows[0]);
    } catch (err) {
      res.status(500).json({ error: "DB insert error", details: err });
    }
  });

  // Update message
  app.put("/messages/:id", async (req, res) => {
    const { text, mood } = req.body;
    if (!text || !mood) return res.status(400).json({ error: "text and mood required" });
    try {
      const [result] = await db.query(
        "UPDATE messages SET text = ?, mood = ? WHERE id = ?",
        [text, mood, req.params.id]
      );
      if (result.affectedRows === 0) return res.status(404).json({ error: "Not found" });
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: "DB update error", details: err });
    }
  });

  // Delete message
  app.delete("/messages/:id", async (req, res) => {
    try {
      const [rows] = await db.query("SELECT image FROM messages WHERE id = ?", [req.params.id]);
      if (rows.length === 0) return res.status(404).json({ error: "Not found" });

      const file = rows[0].image;
      await db.query("DELETE FROM messages WHERE id = ?", [req.params.id]);
      if (file) {
        const full = path.join("images", file);
        fs.existsSync(full) && fs.unlink(full, () => {});
      }
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: "DB delete error", details: err });
    }
  });

  // Get messages by category
  app.get("/messages/category/:mood", async (req, res) => {
    try {
      const [rows] = await db.query(`
        SELECT m.id, m.user_id, m.text, m.mood, m.image, m.created_at, u.username
        FROM messages m
        JOIN users u ON m.user_id = u.id
        WHERE m.mood = ?
        ORDER BY m.created_at DESC
      `, [req.params.mood]);
      res.json(rows);
    } catch (err) {
      res.status(500).json({ error: "Database error", details: err });
    }
  });
   // Random liftup message
app.get("/liftup/random", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM liftup_messages ORDER BY RAND() LIMIT 1"
    );
    res.json(rows[0]); // returns { id, text, emoji, created_at }
  } catch (err) {
    console.error("❌ Error fetching random liftup message:", err);
    res.status(500).json({ error: "Server error" });
  }
});
  /* -------------------- Start server -------------------- */
  const PORT = 5000;
  app.listen(PORT, () => console.log(`✅ Backend running on http://localhost:${PORT}`));
}

init();