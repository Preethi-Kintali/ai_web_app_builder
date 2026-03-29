# 🚀 Prompt2Page – AI-Powered Web App Builder

Prompt2Page is a modern **AI-powered web application builder** that transforms natural language prompts into fully functional web applications.
It combines a **decoupled MERN architecture**, real-time updates, and AI-driven code generation to create an interactive development experience.

---

## ✨ Features

* 💬 **AI Code Generation** – Generate full web apps using natural language (powered by Gemini AI)
* 🔄 **Real-Time Updates** – Live collaboration and updates using Socket.io
* 🧠 **Conversational Builder** – Iteratively refine apps through chat
* 🧾 **Project Management** – Create, edit, version, and manage multiple projects
* 📦 **Export Projects** – Download generated apps as ZIP files
* 🔐 **Authentication** – Secure login/register with JWT and bcrypt
* ⚡ **Live Preview** – Instant rendering of generated code in a sandboxed environment

---

## 🏗️ Architecture Overview

Prompt2Page follows a **decoupled MERN stack architecture** with clear separation between frontend and backend.

```
client/  → React Frontend (UI + Builder)
server/  → Node.js Backend (API + AI + DB)
```

---

## 🎨 Frontend (React + Vite)

Located in `client/`

### 🔹 Key Concepts

* **State Management**: React Context API (`AuthContext`)
* **Routing**: React Router DOM (SPA navigation)
* **API Communication**: Axios (centralized service layer)
* **Real-Time**: Socket.io-client for live updates
* **Styling**: Modular vanilla CSS

### 📦 Key Libraries

* `jszip` → Export projects as ZIP
* `react-markdown` → Render AI responses
* `socket.io-client` → Real-time communication

---

## ⚙️ Backend (Node.js + Express)

Located in `server/`

Built using an **MVC + Service Layer architecture** for scalability and maintainability.

### 🔹 Structure

```
src/
 ├── models/        → MongoDB schemas (User, Project)
 ├── controllers/   → Request handling logic
 ├── routes/        → API endpoints
 ├── services/      → Business logic & AI integration
 ├── middleware/    → Auth, error handling
 └── config/        → External services (Gemini)
```

---

## 🧠 Core Technologies

| Layer      | Technology         | Description                              |
| ---------- | ------------------ | ---------------------------------------- |
| Frontend   | React + Vite       | Fast SPA with modular components         |
| Backend    | Node.js + Express  | REST APIs + business logic               |
| Database   | MongoDB (Mongoose) | Schema-based data storage                |
| Auth       | JWT + Bcrypt       | Secure authentication                    |
| AI         | Google Gemini      | Code generation & reasoning              |
| Realtime   | Socket.io          | Live updates & collaboration             |
| Deployment | Render             | Infrastructure-as-code via `render.yaml` |

---

## 🔄 How It Works

1. User enters a prompt (e.g., *"Build a dashboard UI"*)
2. Frontend sends request to backend
3. Backend:

   * Builds structured prompt
   * Sends to Gemini AI
4. AI returns generated code
5. Backend stores:

   * Code
   * Chat history
   * Versions
6. Frontend:

   * Renders preview
   * Updates UI in real-time

---

## 📂 Project Structure

```
prompt2page/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── context/
│   │   └── styles/
│
├── server/                 # Express backend
│   ├── src/
│   │   ├── models/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── middleware/
│   │   └── config/
│
└── render.yaml            # Deployment config
```

---

## 🔐 Environment Variables

Create a `.env` file in `/server`:

```env
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_secret
GEMINI_API_KEY=your_gemini_api_key
```

---

## ▶️ Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/your-username/prompt2page.git
cd prompt2page
```

### 2. Install dependencies

```bash
cd server && npm install
cd ../client && npm install
```

### 3. Run the app

```bash
# Backend
cd server
npm run dev

# Frontend
cd client
npm run dev
```

---

## 🚀 Deployment

This project is configured for deployment on **Render** using `render.yaml`.

* Backend → Web Service
* Frontend → Static Site

---

## 📈 Project Evolution

* 🔄 Migrated from Python backend → Node.js for unified stack
* 🚀 Evolved from simple “Prompt → Page” tool → full AI development platform
* 📦 Moving towards multi-file project generation & advanced features

---

## 🎯 Future Enhancements

* AI Pair Programmer Mode
* Multi-file project generation
* Code review & optimization engine
* API integration generator
* Deployment automation

---
