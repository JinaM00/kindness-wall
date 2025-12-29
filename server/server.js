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

app.use(cors({
  origin: [
    "http://localhost:3000",                  // local dev
    "https://kindness-wall.netlify.app"       // ✅ Netlify frontend
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],  // include all methods you use
  allowedHeaders: ["Content-Type", "Authorization"]
}));


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

/* -------------------- AUTH -------------------- */
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
    "INSERT INTO users (username, email, password, created_at) VALUES (?,?,?,NOW())",
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
});

// Login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    if (rows.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // ✅ Include id + username in JWT payload
    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "1h" } // optional expiry
    );

    // ✅ Return both token and user object
    res.json({ token, user });
  } catch (err) {
    console.error("❌ Login error:", err);
    res.status(500).json({ error: "DB error", details: err.message });
  }
});

/* -------------------- MESSAGES CRUD -------------------- */
// Example: Get all messages
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
    res.status(500).json({ error: "DB error", details: err.message });
  }
});

// Post a new message
app.post("/messages", upload.single("image"), async (req, res) => {
  const { text, mood } = req.body;
  const image = req.file ? req.file.filename : null;

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

    // ✅ Let MySQL auto-fill created_at (requires schema fix)
   // Post a new message
app.post("/messages", upload.single("image"), async (req, res) => {
  const { text, mood } = req.body;
  const image = req.file ? req.file.filename : null;

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

    // ✅ Insert without created_at (MySQL auto-fills CURRENT_TIMESTAMP)
    const [result] = await db.query(
      "INSERT INTO messages (user_id, text, mood, image) VALUES (?,?,?,?)",
      [userId, text, mood, image]
    );

    res.json({ success: true, id: result.insertId });
  } catch (err) {
    console.error("❌ Message error:", err);
    res.status(500).json({ error: "Database error", details: err.message });
  }
}); const [result] = await db.query(
      "INSERT INTO messages (user_id, text, mood, image) VALUES (?,?,?,?)",
      [userId, text, mood, image]
    );

    res.json({ success: true, id: result.insertId });
  } catch (err) {
    console.error("❌ Message error:", err);
    res.status(500).json({ error: "Database error", details: err.message });
  }
});

let currentPrompt = null;

// Function to fetch a random prompt from DB
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

// Run every 15 seconds
setInterval(updatePrompt, 15000);

// Endpoint to get the current prompt
app.get("/current_prompt", (req, res) => {
  if (currentPrompt) {
    res.json(currentPrompt);
  } else {
    res.json({ message: "No prompt yet" });
  }
});

// Add this in server.js
app.get("/liftup/random", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT id, text, emoji FROM liftup_messages ORDER BY RAND() LIMIT 1"
    );
    if (rows.length > 0) {
      res.json(rows[0]);
    } else {
      res.status(404).json({ error: "No featured kindness available" });
    }
  } catch (err) {
    console.error("❌ Error fetching featured kindness:", err);
    res.status(500).json({ error: "Database error", details: err.message });
  }
});

// Temporary route to fix schema
app.get("/fix-image-null", async (req, res) => {
  try {
    await db.query(`
      ALTER TABLE messages 
      MODIFY image VARCHAR(255) NULL
    `);
    res.json({ success: true, message: "✅ Image column now allows NULL" });
  } catch (err) {
    console.error("❌ Schema fix error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Temporary route to fix schema
app.get("/fix-schema", async (req, res) => {
  try {
    await db.query(`
      ALTER TABLE messages 
      MODIFY created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    `);

    await db.query(`
      ALTER TABLE messages 
      MODIFY image VARCHAR(255) NULL
    `);

    res.json({ success: true, message: "Schema fixed ✅" });
  } catch (err) {
    console.error("❌ Schema fix error:", err);
    res.status(500).json({ error: err.message });
  }
});

// (Keep your other CRUD routes here: single message, create, update, delete, category, liftup/random)

/* -------------------- Start server -------------------- */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`);
});