from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from app.middleware.auth_guard import require_admin
from app.services.supabase_client import supabase
from datetime import datetime, timezone

router = APIRouter(prefix="/admin", tags=["Admin"])



@router.get("/users")
def get_all_users(_=Depends(require_admin)):
    res = supabase.table("profiles").select("id, name, email, role, created_at").order("created_at").execute()
    return res.data



@router.get("/dashboard")
def admin_dashboard(_=Depends(require_admin)):
    users   = supabase.table("profiles").select("id, name, email, role, created_at").execute()
    entries = supabase.table("entries").select("user_id, type, amount, date").execute()
    udhar   = supabase.table("udhar").select("user_id, type, amount, paid_amount, status, date").execute()

    all_users   = users.data   or []
    all_entries = entries.data or []
    all_udhar   = udhar.data   or []


    total_users = len(all_users)
    total_entries = len(all_entries)

    now = datetime.now(timezone.utc)
    current_ym = f"{now.year}-{str(now.month).zfill(2)}"
    new_this_month = sum(
        1 for u in all_users
        if u.get("created_at", "")[:7] == current_ym
    )

    users_with_udhar = len(set(
        x["user_id"] for x in all_udhar if x["status"] != "paid"
    ))


    from collections import defaultdict

    entry_counts  = defaultdict(int)
    last_active   = defaultdict(str)

    for e in all_entries:
        uid = e["user_id"]
        entry_counts[uid] += 1
        if e.get("date", "") > last_active[uid]:
            last_active[uid] = e["date"]

    udhar_pending = defaultdict(float)
    for u in all_udhar:
        if u["status"] != "paid":
            uid = u["user_id"]
            udhar_pending[uid] += u["amount"] - (u.get("paid_amount") or 0)

    enriched_users = []
    for u in all_users:
        uid = u["id"]
        enriched_users.append({
            **u,
            "total_entries": entry_counts[uid],
            "last_active":   last_active.get(uid, None),
            "udhar_pending": round(udhar_pending[uid], 2),
        })

    return {
        "total_users":         total_users,
        "total_entries":       total_entries,
        "new_this_month":      new_this_month,
        "users_with_udhar":    users_with_udhar,
        "users":               enriched_users,
    }



@router.get("/users/{user_id}/full")
def get_user_full(user_id: str, _=Depends(require_admin)):
    profile = supabase.table("profiles").select("*").eq("id", user_id).single().execute()
    entries = supabase.table("entries").select("*").eq("user_id", user_id).order("date", desc=True).execute()
    udhar   = supabase.table("udhar").select("*").eq("user_id", user_id).order("date", desc=True).execute()

    e = entries.data or []
    u = udhar.data   or []

    total_income  = sum(x["amount"] for x in e if x["type"] == "income")
    total_expense = sum(x["amount"] for x in e if x["type"] == "expense")

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
            "total_income":       total_income,
            "total_expense":      total_expense,
            "net_balance":        total_income - total_expense + udhar_gave_pending - udhar_got_pending,
            "udhar_gave_pending": udhar_gave_pending,
            "udhar_got_pending":  udhar_got_pending,
        },
        "entries": e,
        "udhar":   u,
    }



class RoleUpdate(BaseModel):
    role: str

@router.patch("/users/{user_id}/role")
def update_user_role(user_id: str, body: RoleUpdate, admin=Depends(require_admin)):
    if body.role not in ("admin", "user"):
        raise HTTPException(status_code=400, detail="Role must be 'admin' or 'user'")
    if user_id == admin["id"] and body.role == "user":
        admin_count = len([
            u for u in (supabase.table("profiles").select("id,role").execute().data or [])
            if u["role"] == "admin"
        ])
        if admin_count <= 1:
            raise HTTPException(status_code=400, detail="Cannot demote yourself — you are the last admin")
    supabase.table("profiles").update({"role": body.role}).eq("id", user_id).execute()
    return {"message": f"Role updated to {body.role}"}



@router.delete("/users/{user_id}")
def delete_user(user_id: str, admin=Depends(require_admin)):
    if user_id == admin["id"]:
        raise HTTPException(status_code=400, detail="Cannot delete your own account")
    supabase.auth.admin.delete_user(user_id)
    return {"message": "User deleted"}