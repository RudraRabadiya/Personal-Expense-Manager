# PERSSONAL EXPENSE MANAGER Frontend (React + Vite)

## Setup

1. **Install dependencies**
```bash
npm install
```

2. **Create `.env`** (copy from `.env.example`):
```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_URL=https://your-backend.onrender.com
```
> For local dev: VITE_API_URL=http://localhost:8000

3. **Run locally**
```bash
npm run dev
```
Frontend runs at: http://localhost:5173



## Features
- Login / Register
- Dashboard with income, expense, balance stats
- Add/Delete expenses and income
- Udhar Book — track who owes you and who you owe
- Mark udhar as paid
- Admin view — see all users and their complete data
