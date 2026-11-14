<div align="center">

# 🔄 SkillSwap — Trade Skills, Not Money

[![Node.js](https://img.shields.io/badge/Node.js-v24%2B-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-v19-blue.svg)](https://react.dev/)
[![Express](https://img.shields.io/badge/Express-v5-lightgrey.svg)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-brightgreen.svg)](https://www.mongodb.com/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-v4-38bdf8.svg)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-ISC-yellow.svg)](LICENSE)

*A peer-to-peer knowledge exchange platform where the currency is what you know.*

[Features](#-features) • [Matching Engine](#-matching-algorithm) • [Tech Stack](#-tech-stack) • [Getting Started](#-getting-started) • [API Docs](#-api-overview) • [Demo Accounts](#-demo-accounts)

</div>

---

## 🌟 Overview

**SkillSwap** is a full-stack MERN peer-to-peer learning platform designed for university campuses and learning communities. Instead of paying monetary fees or relying on commercial tutors, students swap skills directly: *I teach you JavaScript, you teach me UI Design.* 

Built according to formal Software Engineering specifications (**CSE 3638 Software Engineering Lab**), SkillSwap features a deterministic **100-point rule-based matching engine**, a **Skill Credit economy**, secure **JWT authentication**, **Firebase Google Sign-In**, and an **Admin control center**.

---

## ✨ Features & Architecture

| Module | Proposal Ref | Description |
| :--- | :---: | :--- |
| **Skill Profiles** | §6.1 | Categorized teach/learn lists with proficiency levels (Beginner, Intermediate, Advanced) backed by an admin-managed master list. |
| **Matching Engine** | §6.2 | Deterministic scoring algorithm out of **100** (Teach match: 40pts, Learn match: 40pts, Level fit: 10pts, Availability/Mode: 10pts). |
| **Swap Requests** | §6.3 | Formal workflow (`pending` → `accepted` / `rejected` / `cancelled`). Mutual consent required before any session. |
| **Session Scheduling** | §6.4 | Scheduled sessions with date, time, duration, and Online/Offline mode with meeting links or physical location. |
| **Ratings & Reputation** | §6.5 | Post-session 1–5 star reviews, average rating calculation, and dynamic mentor badges (*Helpful Mentor*, *Active Learner*, *Reliable Partner*). |
| **Skill Credit Economy** | §6.6 | Teach sessions to earn **+1 Credit**, spend credits for one-way learning. Balances never go negative. New accounts receive **2 free credits**. |
| **Admin Control Center** | §6.7 | Comprehensive dashboard for user moderation (suspend/activate), skill catalog CRUD, audit logs, and safety report resolutions. |
| **Security & Roles** | §5 & §9 | Role-based access control (Student / Admin), bcrypt password hashing, and secure JWT verification middleware. |

---

## 🧠 The 100-Point Matching Algorithm (§6.2)

Our matching algorithm computes live compatibility scores for every student pair:

```
┌────────────────────────────────────────────────────────┐
│  You teach what they want to learn  →  +40 pts         │
│  They teach what you want to learn  →  +40 pts         │
│  Compatible skill levels            →  +10 pts         │
│  Compatible availability & mode     →  +10 pts         │
├────────────────────────────────────────────────────────> Total: 100 pts
│  • 100 pts : Perfect Two-Way Swap (0 credits required) │
│  • 40–80pt : One-Way Match (Credit eligible)           │
│  • < 40 pt : Hidden from recommendations               │
└────────────────────────────────────────────────────────┘
```

---

## 🛠 Tech Stack

* **Frontend:** React 19, Vite, TailwindCSS v4, React Router DOM, Axios.
* **Backend:** Node.js, Express 5 REST API.
* **Database:** MongoDB & Mongoose 9 — **features a fully functional in-memory fallback mode** allowing zero-config startup!
* **Authentication:** JSON Web Tokens (JWT), bcryptjs, Firebase Auth & Admin SDK.

---

## 📁 Project Structure

```text
skillswap/
├── client/                  # React 19 Vite Frontend
│   ├── src/
│   │   ├── pages/           # Landing, Login, Register, Dashboard, Admin
│   │   ├── components/      # Navbar, ProtectedRoute, UI components
│   │   ├── context/         # AuthContext (JWT state management)
│   │   └── lib/             # API client & Firebase config
│   └── index.html
├── server/                  # Express 5 Backend
│   ├── config/              # DB connection & Firebase Admin setup
│   ├── models/              # Mongoose schemas (User, Skill, Request, Session, Review, Report)
│   ├── middleware/          # JWT auth & admin guard middleware
│   ├── routes/              # REST endpoints (auth, skills, users, requests, sessions, reviews, reports, credits, admin)
│   ├── utils/               # Matching scorer & in-memory data store
│   ├── seed.js              # Initial database seeder
│   └── server.js            # Express application entry point
├── SkillSwap_Project_Proposal.pdf
└── README.md
```

---

## 🚀 Getting Started in 2 Minutes

**Prerequisites:** Node.js v20+ and npm installed. *(MongoDB is completely optional thanks to the built-in in-memory fallback!)*

### 1. Clone & Start Backend Server
```bash
cd server
npm install
npm run dev
```
*The server boots on `http://localhost:5001` with pre-seeded demo users and skills.*

### 2. Start Frontend Client
Open a second terminal window:
```bash
cd client
npm install
npm run dev
```
*The Vite frontend launches on `http://localhost:3000`.*

---

## 🔑 Demo Accounts (Pre-Seeded)

Test any role instantly using these pre-configured credentials:

| Role | Email | Password | Description |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@skillswap.local` | `admin123` | Full access to stats, user suspension, and reports queue |
| **Student (Rahim)** | `rahim@student.local` | `student123` | Active student with teach/learn skills and active matches |
| **Student (Nusrat)** | `nusrat@student.local` | `student123` | Perfect two-way match partner |
| **Student (Tanvir)** | `tanvir@student.local` | `student123` | Student with credit balance |

---

## 🔥 Google Sign-In Integration (Optional)

Email/password authentication works instantly out of the box. To enable **Google Sign-In**:

1. Create a project in the [Firebase Console](https://console.firebase.google.com).
2. Enable **Authentication → Sign-in method → Google**.
3. Register a Web App and copy your configuration keys into `client/.env`:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```
4. Generate a Service Account Private Key in Firebase Project Settings and add it to `server/.env`:
   ```env
   FIREBASE_PROJECT_ID=your_project_id
   FIREBASE_CLIENT_EMAIL=firebase-adminsdk-...@...gserviceaccount.com
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   ```

   ⚠️ **Troubleshooting `auth/unauthorized-domain`:**
   If Google Sign-In throws an unauthorized domain error, go to **Firebase Console → Authentication → Settings → Authorized domains** and click **Add Domain** to add `localhost` and `127.0.0.1`.

---

## 🔌 API Reference Quick Map

* **Auth:** `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/google`, `GET /api/auth/me`
* **Skills:** `GET /api/skills`, `POST /api/skills` *(Admin)*
* **Matching & Users:** `GET /api/users/matches`, `POST /api/users/skills`, `GET /api/users/:id`
* **Swap Requests:** `GET /api/requests`, `POST /api/requests`, `PUT /api/requests/:id/accept`
* **Sessions:** `GET /api/sessions`, `POST /api/sessions`, `PUT /api/sessions/:id/complete`
* **Reviews & Credits:** `POST /api/reviews`, `GET /api/credits/balance`
* **Admin Control:** `GET /api/admin/stats`, `GET /api/admin/users`, `PUT /api/admin/users/:id`

---

## 👥 Team CodeXchange

Developed as part of the **CSE 3640 Software Engineering Lab**. 
*Team CodeXchange* · University learning initiative.
