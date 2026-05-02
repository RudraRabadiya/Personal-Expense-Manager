from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import auth, entries, udhar, admin, payments, reports

import os

app = FastAPI()

frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        frontend_url,
        "http://localhost:5173",
<<<<<<< HEAD
        "http://localhost:5174",
        "http://localhost:5175",
        "http://localhost:3000",
        "personal-expense-manager-nhvvb9poc.vercel.app",
=======
        "https://personal-expense-manager-nhvvb9poc.vercel.app"
>>>>>>> 18e3dec (update main)
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(entries.router)
app.include_router(udhar.router)  
app.include_router(admin.router)
app.include_router(payments.router)
app.include_router(reports.router)

@app.get("/")
def root():
    return {"status": "KhataBook API running ✅"}

@app.get("/health")
def health():
    return {"status": "ok"}
