# 🌸 Kindness Wall

The **Kindness Wall** is a full‑stack web application where users can post uplifting notes, images, and moods to spread positivity. Built with **React**, **Node.js/Express**, and **MySQL**, it’s deployed on **Netlify** (frontend) and **Render** (backend).

---

## ✨ Features
- User **signup/login** with JWT authentication
- Post, edit, and delete kindness notes
- Upload images with notes
- Categories: Joy, Gratitude, Hope
- Responsive UI with pagination
- Persistent login state (tokens stored in localStorage)

---

## 🛠 Tech Stack
- **Frontend**: React, Netlify
- **Backend**: Node.js, Express, Render
- **Database**: MySQL
- **Auth**: JWT

---

## 🚀 Setup Instructions

### 1. Clone the repository
```bash
git clone https://github.com/<your-username>/kindness-wall.git
cd kindness-wall

2. Install dependencies
npm install

3. Configure environment variables
Create a .env file in the frontend
REACT_APP_API_URL=https://kindness-wall-1.onrender.com

For backend (Render), set environment variables in the Render dashboard:
DB_HOST=<your-db-host>
DB_USER=<your-db-user>
DB_PASSWORD=<your-db-password>
DB_NAME=<your-db-name>
JWT_SECRET=<your-secret>

4. Run locally
Frontend:
npm start

Backend:
node server.js

🌐 Deployment
- Frontend: Netlify auto‑deploys from GitHub
- Backend: Render auto‑deploys from GitHub
- Environment variables configured in both platforms
- Live backend: https://kindness-wall-1.onrender.com


📖 Usage
- Go to the deployed site
- Sign up or log in
- Post a kindness note with text, mood, and optional image
- Filter notes by category
- Edit or delete your own notes

🔮 Future Improvements
- User profiles with personal walls
- Likes/reactions on notes
- Search bar for filtering messages
- Admin dashboard for moderation
- Enhanced styling and animations

👩‍💻 Contributors
- Ji 🌸 (Full‑stack developer)

📜 License
This project is licensed under the MIT License.

---

## 🌿 Key takeaway
- This README explains **what the project is**, **how to run it**, **how to deploy it**, and **future improvements**.  

---

