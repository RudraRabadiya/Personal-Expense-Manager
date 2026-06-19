from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import auth, entries, udhar, admin, payments, reports

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://personal-expense-manager-gules.vercel.app",
        "https://personalexpensemanager.dpdns.org",
        "http://localhost:5173",
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
    return {"status": "PEM API running ✅"}

@app.get("/health")
def health():
    return {"status": "ok"}