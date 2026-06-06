<div align="center">

# 💰 Personal Expense Manager

### A full-stack personal finance tracker — built to make managing money effortless.

[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com)
[![Vite](https://img.shields.io/badge/Vite-Build_Tool-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

**Created by [Rudra J Rabadiya](https://github.com/Rudra-7127)**

</div>

---

## ✨ Features

<table>
  <thead>
    <tr>
      <th>Feature</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr><td>🔐 <strong>Authentication</strong></td><td>Secure register &amp; login with JWT-based auth via Supabase</td></tr>
    <tr><td>📊 <strong>Dashboard</strong></td><td>At-a-glance overview of income, expenses &amp; current balance</td></tr>
    <tr><td>📉 <strong>Expenses</strong></td><td>Add, edit, and delete expense entries with category tagging</td></tr>
    <tr><td>📈 <strong>Income</strong></td><td>Track multiple income sources separately</td></tr>
    <tr><td>🤝 <strong>Udhar Book</strong></td><td>Manage money lent &amp; borrowed with mark-as-paid support</td></tr>
    <tr><td>📋 <strong>All Entries</strong></td><td>Unified transaction view with powerful filters</td></tr>
    <tr><td>📑 <strong>Reports</strong></td><td>Visual charts + export to PDF or Excel</td></tr>
    <tr><td>👤 <strong>Profile</strong></td><td>View and update your personal profile</td></tr>
    <tr><td>👑 <strong>Admin Panel</strong></td><td>Platform-wide user management and platform stats (admin only)</td></tr>
    <tr><td>🌙 <strong>Dark / Light Mode</strong></td><td>Theme toggle with persistent preference</td></tr>
  </tbody>
</table>

---

## 🏗️ Tech Stack

<table>
  <tr>
    <td valign="top" width="50%">

### 🖥️ Frontend

| Technology | Purpose |
|---|---|
| **React 18** | UI framework |
| **Vite** | Build tool & dev server |
| **React Router v6** | Client-side routing |
| **Recharts** | Charts & data visualisation |
| **jsPDF + AutoTable** | PDF export |
| **XLSX** | Excel export |
| **react-hot-toast** | Toast notifications |
| **Supabase JS** | Auth token management |

  </td>
  <td valign="top" width="50%">

### ⚙️ Backend

| Technology | Purpose |
|---|---|
| **FastAPI** | REST API framework |
| **Supabase** | PostgreSQL database + Auth |
| **python-jose** | JWT verification |
| **Pydantic v2** | Request/response validation |
| **Uvicorn** | ASGI server |

  </td>
  </tr>
</table>

---

## 📁 Project Structure

```
Personal Expense Manager/
│
├── 🖥️  PEM-Frontend/              # React + Vite frontend
│   ├── src/
│   │   ├── components/            # Reusable layout & modal components
│   │   ├── context/               # Auth & Theme context providers
│   │   ├── lib/                   # Utilities & constants
│   │   ├── pages/                 # All page components
│   │   │   └── admin/             # Admin-only pages
│   │   └── styles/                # Global CSS
│   └── index.html
│
└── ⚙️  PEM-Backend/               # FastAPI backend
    ├── app/
    │   ├── main.py                # FastAPI app entry point
    │   ├── routes/                # API route handlers
    │   └── models/                # Pydantic schemas
    └── supabase/
        └── schema.sql             # Database schema
```

---

## 🚀 Getting Started

### Prerequisites

> Make sure you have the following installed before proceeding.

| Requirement | Version |
|---|---|
| [Node.js](https://nodejs.org) | ≥ 18 |
| [Python](https://python.org) | ≥ 3.11 |
| [Supabase](https://supabase.com) | Active project |

---

### Step 1 — Clone the Repository

```bash
git clone https://github.com/Rudra-7127/Personal-Expense-Manager.git
cd Personal-Expense-Manager
```

---

### Step 2 — Backend Setup

```bash
cd PEM-Backend

# Create and activate a virtual environment
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # macOS / Linux

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# → Open .env and fill in your Supabase credentials
```

**Required `.env` variables:**

```env
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
SUPABASE_JWT_SECRET=your-jwt-secret
ALLOWED_ORIGINS=http://localhost:5173
```

> 💡 Get these from: **Supabase Dashboard → Settings → API**

**Run the database schema:**

1. Go to **Supabase Dashboard → SQL Editor**
2. Paste and run the contents of `supabase/schema.sql`

**Start the backend:**

```bash
uvicorn app.main:app --reload
```

✅ API is live at: `http://localhost:8000`

---

### Step 3 — Frontend Setup

```bash
cd PEM-Frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# → Open .env and fill in your API URL and Supabase credentials
```

**Required `.env` variables:**

```env
VITE_API_URL=http://localhost:8000
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

**Start the dev server:**

```bash
npm run dev
```

✅ App is live at: `http://localhost:5173`

---

## 📡 API Reference

| Method | Route | Auth | Description |
|--------|-------|:----:|-------------|
| `POST` | `/auth/register` | — | Register a new user |
| `POST` | `/auth/login` | — | Login and receive JWT |
| `GET` | `/auth/me` | 🔒 | Get current user info |
| `GET` | `/entries/` | 🔒 | List all entries |
| `POST` | `/entries/` | 🔒 | Create a new entry |
| `PUT` | `/entries/{id}` | 🔒 | Update an entry |
| `DELETE` | `/entries/{id}` | 🔒 | Delete an entry |
| `GET` | `/udhar/` | 🔒 | List udhar records |
| `POST` | `/udhar/` | 🔒 | Add an udhar record |
| `PATCH` | `/udhar/{id}/mark-paid` | 🔒 | Mark udhar as paid |
| `GET` | `/admin/users` | 👑 | List all platform users |
| `GET` | `/admin/users/{id}/full` | 👑 | Full detail of a user |
| `GET` | `/admin/dashboard` | 👑 | Platform-wide statistics |

> 🔒 = Requires JWT token &nbsp;&nbsp; 👑 = Admin role required

---

## ☁️ Deployment

### Backend → [Render](https://render.com)

1. Create a **New Web Service** and connect your GitHub repo
2. Set **Root Directory** to `PEM-Backend`
3. **Build Command:** `pip install -r requirements.txt`
4. **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Add all `.env` variables under the **Environment** tab

### Frontend → [Vercel](https://vercel.com) / [Netlify](https://netlify.com)

1. Connect your repo and set **Root Directory** to `PEM-Frontend`
2. **Build Command:** `npm run build`
3. **Output Directory:** `dist`
4. Add all `VITE_*` variables in the platform's environment settings

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).

---

<div align="center">

Made by **[Rudra J Rabadiya](https://github.com/Rudra-7127)**

[![Instagram](https://img.shields.io/badge/%40rudra.rabadiya.07-E4405F?style=for-the-badge&logo=instagram&logoColor=white)](https://www.instagram.com/rudra.rabadiya.07/)

© 2026 · All Rights Reserved

</div>
