# PERSONAL EXPENSE MANAGER Backend (FastAPI + Supabase)

## Setup

1. **Clone & install**
```bash
pip install -r requirements.txt
```

2. **Create `.env`** (copy from `.env.example`):
```
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
SUPABASE_JWT_SECRET=your-jwt-secret
ALLOWED_ORIGINS=http://localhost:5173,https://your-frontend.vercel.app
```
> Get these from: Supabase Dashboard → Settings → API

3. **Run Supabase schema**
- Go to Supabase Dashboard → SQL Editor
- Paste and run `supabase/schema.sql`

4. **Run locally**
```bash
uvicorn app.main:app --reload
```
API runs at: http://localhost:8000

## Deploy to Render
- New Web Service → connect your repo
- Build command: `pip install -r requirements.txt`
- Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- Add all `.env` variables in Render → Environment

## API Endpoints
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | /auth/register | ❌ | Register new user |
| POST | /auth/login | ❌ | Login → get token |
| GET | /auth/me | ✅ | Get current user |
| GET | /entries/ | ✅ | My entries |
| POST | /entries/ | ✅ | Add entry |
| PUT | /entries/{id} | ✅ | Update entry |
| DELETE | /entries/{id} | ✅ | Delete entry |
| GET | /udhar/ | ✅ | My udhar list |
| POST | /udhar/ | ✅ | Add udhar |
| PATCH | /udhar/{id}/mark-paid | ✅ | Mark paid |
| GET | /admin/users | 👑 Admin | All users |
| GET | /admin/users/{id}/full | 👑 Admin | User full detail |
| GET | /admin/dashboard | 👑 Admin | Platform stats |
