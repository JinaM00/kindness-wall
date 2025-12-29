const express = require("express");
const mysql = require("mysql2/promise");

const app = express();

console.log("🚀 Starting server.js...");

(async () => {
  try {
    const db = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT
    });
    console.log("✅ Connected to MySQL database");
  } catch (err) {
    console.error("❌ DB connection failed:", err.message);
  }
})();

app.get("/", (req, res) => {
  res.send("Hello from kindness-wall backend!");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Backend running on port ${PORT}`);
});// const express = require("express");
// const mysql = require("mysql2/promise");
// const cors = require("cors");
// const multer = require("multer");
// const path = require("path");
// const fs = require("fs");
// const bcrypt = require("bcrypt");
// const jwt = require("jsonwebtoken");

// const app = express();
// app.use(cors());
// app.use(express.json());

// // ✅ Database connection
// let db;
// (async () => {
//   try {
//     db = await mysql.createConnection({
//       host: process.env.DB_HOST,
//       user: process.env.DB_USER,
//       password: process.env.DB_PASSWORD,
//       database: process.env.DB_NAME,
//       port: process.env.DB_PORT
//     });
//     console.log("✅ Connected to MySQL database");
//   } catch (err) {
//     console.error("❌ DB connection failed:", err.message);
//   }
// })();

// // Serve uploaded images
// app.use("/images", express.static("images"));
// if (!fs.existsSync("images")) fs.mkdirSync("images");

// // Multer storage
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => cb(null, "images/"),
//   filename: (req, file, cb) => {
//     const ext = path.extname(file.originalname);
//     const base = path.basename(file.originalname, ext).replace(/\s+/g, "_");
//     cb(null, `${base}_${Date.now()}${ext}`);
//   },
// });
// const upload = multer({ storage });

// /* -------------------- AUTH -------------------- */

// // Signup
// app.post("/signup", async (req, res) => {
//   const { username, email, password } = req.body;
//   if (!username || !email || !password) {
//     return res.status(400).json({ error: "All fields required" });
//   }
//   if (password.length < 6) {
//     return res.status(400).json({ error: "Password must be at least 6 characters long" });
//   }
//   try {
//     const hashed = await bcrypt.hash(password, 10);
//     const [result] = await db.query(
//       "INSERT INTO users (username, email, password) VALUES (?,?,?)",
//       [username, email, hashed]
//     );
//     res.json({ success: true, id: result.insertId });
//   } catch (err) {
//     if (err.code === "ER_DUP_ENTRY" && err.sqlMessage.includes("email")) {
//       return res.status(400).json({ error: "Email already registered" });
//     }
//     if (err.code === "ER_DUP_ENTRY" && err.sqlMessage.includes("username")) {
//       return res.status(400).json({ error: "Username already taken" });
//     }
//     res.status(500).json({ error: "Database error", details: err.message });
//   }
// });

// // Login
// app.post("/login", async (req, res) => {
//   const { email, password } = req.body;
//   try {
//     const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
//     if (rows.length === 0) return res.status(401).json({ error: "Invalid credentials" });

//     const user = rows[0];
//     const match = await bcrypt.compare(password, user.password);
//     if (!match) return res.status(401).json({ error: "Invalid credentials" });

//     const token = jwt.sign(
//       { id: user.id, username: user.username },
//       process.env.JWT_SECRET,
//       { expiresIn: "7d" }
//     );
//     res.json({ token });
//   } catch (err) {
//     res.status(500).json({ error: "DB error", details: err.message });
//   }
// });

// /* -------------------- MESSAGES CRUD -------------------- */
// // … keep your message routes here, outside of init()

// /* -------------------- Start server -------------------- */
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//   console.log(`✅ Backend running on port ${PORT}`);
// });