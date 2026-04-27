from fastapi import APIRouter, Depends
from app.middleware.auth_guard import require_admin
from app.services.supabase_client import supabase

router = APIRouter(prefix="/admin", tags=["Admin"])

@router.get("/users")
def get_all_users(_=Depends(require_admin)):
    res = supabase.table("profiles").select("id, name, email, role, created_at").order("created_at").execute()
    return res.data

@router.get("/users/{user_id}/full")
def get_user_full(user_id: str, _=Depends(require_admin)):
    profile = supabase.table("profiles").select("*").eq("id", user_id).single().execute()
    entries = supabase.table("entries").select("*").eq("user_id", user_id).order("date", desc=True).execute()
    udhar = supabase.table("udhar").select("*").eq("user_id", user_id).order("date", desc=True).execute()

    e = entries.data or []
    u = udhar.data or []

    total_income = sum(x["amount"] for x in e if x["type"] == "income")
    total_expense = sum(x["amount"] for x in e if x["type"] == "expense")

    # Use REMAINING amount (total - paid), only non-fully-paid entries
    udhar_gave_pending = sum(
        x["amount"] - (x.get("paid_amount") or 0)
        for x in u if x["type"] == "gave" and x["status"] != "paid"
    )
    udhar_got_pending = sum(
        x["amount"] - (x.get("paid_amount") or 0)
        for x in u if x["type"] == "got" and x["status"] != "paid"
    )

    return {
        "profile": profile.data,
        "summary": {
            "total_income": total_income,
            "total_expense": total_expense,
            "net_balance": total_income - total_expense + udhar_gave_pending - udhar_got_pending,
            "udhar_gave_pending": udhar_gave_pending,
            "udhar_got_pending": udhar_got_pending,
        },
        "entries": e,
        "udhar": u,
    }

@router.get("/dashboard")
def admin_dashboard(_=Depends(require_admin)):
    users = supabase.table("profiles").select("id, name, email, role").execute()
    entries = supabase.table("entries").select("type, amount").execute()
    udhar = supabase.table("udhar").select("type, amount, paid_amount, status").execute()

    e = entries.data or []
    u = udhar.data or []

    total_udhar_pending = sum(
        x["amount"] - (x.get("paid_amount") or 0)
        for x in u if x["status"] != "paid"
    )

    return {
        "total_users": len([x for x in users.data if x["role"] == "user"]),
        "total_income": sum(x["amount"] for x in e if x["type"] == "income"),
        "total_expense": sum(x["amount"] for x in e if x["type"] == "expense"),
        "total_udhar_pending": total_udhar_pending,
        "users": users.data,
    }