# 💰 Personal Expense Manager (PEM)

> A full-stack personal finance tracker with expense & income management, Udhar Book, reports, and an admin panel.

**Created by [Rudra J Rabadiya](https://github.com/Rudra-7127)**

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔐 Auth | Register / Login with JWT-based authentication |
| 📊 Dashboard | Overview of income, expenses & balance at a glance |
| ↓ Expenses | Add, edit, delete expense entries with categories |
| ↑ Income | Track income sources separately |
| ⇌ Udhar Book | Manage money lent/borrowed with mark-as-paid support |
| ☰ All Entries | Unified view of all transactions with filters |
| ↗ Reports | Visual charts + PDF / Excel export |
| 👤 Profile | View and update your profile |
| 👑 Admin Panel | Platform-wide user management and stats (admin only) |
| 🌙 Dark / Light Mode | Theme toggle persisted across sessions |

---

## 🏗️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 18 | UI framework |
| Vite | Build tool & dev server |
| React Router v6 | Client-side routing |
| Recharts | Charts & data visualisation |
| jsPDF + AutoTable | PDF export |
| XLSX | Excel export |
| react-hot-toast | Toast notifications |
| Supabase JS | Auth token management |

### Backend
| Technology | Purpose |
|---|---|
| FastAPI | REST API framework |
| Supabase | PostgreSQL database + Auth |
| python-jose | JWT verification |
| Pydantic v2 | Request/response validation |
| Uvicorn | ASGI server |

---

## 📁 Project Structure

```
Personal Expense Manager/
├── PEM-Frontend/          # React + Vite frontend
│   ├── src/
│   │   ├── components/    # Layout, Modals
│   │   ├── context/       # Auth & Theme context
│   │   ├── lib/           # Utilities, constants
│   │   ├── pages/         # All page components
│   │   │   └── admin/     # Admin-only pages
│   │   └── styles/        # Global CSS
│   └── index.html
│
└── PEM-Backend/           # FastAPI backend
    ├── app/
    │   ├── main.py        # FastAPI app entry point
    │   ├── routes/        # API route handlers
    │   └── models/        # Pydantic schemas
    └── supabase/
        └── schema.sql     # Database schema
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js ≥ 18
- Python ≥ 3.11
- A [Supabase](https://supabase.com) project

---

### 1. Clone the repository

```bash
git clone https://github.com/Rudra-7127/Personal-Expense-Manager.git
cd Personal-Expense-Manager
```

---

### 2. Backend Setup

```bash
cd PEM-Backend

# Create and activate virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Fill in your Supabase credentials in .env
```

**.env variables:**
```env
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
SUPABASE_JWT_SECRET=your-jwt-secret
ALLOWED_ORIGINS=http://localhost:5173
```
> Get these from: **Supabase Dashboard → Settings → API**

**Run the database schema:**
- Go to Supabase Dashboard → SQL Editor
- Paste and run `supabase/schema.sql`

**Start the backend:**
```bash
uvicorn app.main:app --reload
```
API runs at: `http://localhost:8000`

---

### 3. Frontend Setup

```bash
cd PEM-Frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Fill in your API URL and Supabase credentials
```

**.env variables:**
```env
VITE_API_URL=http://localhost:8000
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

**Start the dev server:**
```bash
npm run dev
```
App runs at: `http://localhost:5173`

---

## 📡 API Endpoints

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/auth/register` | ❌ | Register new user |
| POST | `/auth/login` | ❌ | Login → get JWT token |
| GET | `/auth/me` | ✅ | Get current user |
| GET | `/entries/` | ✅ | List my entries |
| POST | `/entries/` | ✅ | Add entry |
| PUT | `/entries/{id}` | ✅ | Update entry |
| DELETE | `/entries/{id}` | ✅ | Delete entry |
| GET | `/udhar/` | ✅ | My udhar list |
| POST | `/udhar/` | ✅ | Add udhar record |
| PATCH | `/udhar/{id}/mark-paid` | ✅ | Mark udhar as paid |
| GET | `/admin/users` | 👑 Admin | All users |
| GET | `/admin/users/{id}/full` | 👑 Admin | User full detail |
| GET | `/admin/dashboard` | 👑 Admin | Platform stats |

---

## ☁️ Deployment

### Backend → Render
1. New Web Service → connect your GitHub repo
2. Root directory: `PEM-Backend`
3. Build command: `pip install -r requirements.txt`
4. Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Add all `.env` variables under **Environment**

### Frontend → Vercel / Netlify
1. Connect repo, set root directory to `PEM-Frontend`
2. Build command: `npm run build`
3. Output directory: `dist`
4. Add all `VITE_*` environment variables in the dashboard

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).

---

<div align="center">
  Made with ♥ by <strong>Rudra J Rabadiya</strong>
</div>
