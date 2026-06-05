from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime, timezone
from app.models.udhar import UdharCreate, UdharUpdate
from app.middleware.auth_guard import get_current_user, require_admin
from app.services.supabase_client import supabase

router = APIRouter(prefix="/udhar", tags=["Udhar"])

@router.get("/")
def get_udhar(user=Depends(get_current_user)):
    res = supabase.table("udhar").select("*").eq("user_id", user["id"]).order("date", desc=True).execute()
    return res.data

@router.post("/")
def create_udhar(body: UdharCreate, user=Depends(get_current_user)):
    if body.type not in ("gave", "got"):
        raise HTTPException(400, "Type must be 'gave' or 'got'")
    data = body.model_dump()
    data["user_id"] = user["id"]
    data["status"]  = "pending"
    data["date"]    = str(body.date)
    if body.due_date:
        data["due_date"] = str(body.due_date)
    else:
        data.pop("due_date", None)
    res = supabase.table("udhar").insert(data).execute()
    return res.data[0]

@router.put("/{udhar_id}")
def update_udhar(udhar_id: str, body: UdharUpdate, user=Depends(get_current_user)):
    existing = supabase.table("udhar").select("id").eq("id", udhar_id).eq("user_id", user["id"]).execute()
    if not existing.data:
        raise HTTPException(404, "Udhar entry not found or not yours")
    # Only include fields that were explicitly set (not None)
    update_data = {k: v for k, v in body.model_dump().items() if v is not None}
    if "date" in update_data:
        update_data["date"] = str(update_data["date"])
    if "due_date" in update_data:
        update_data["due_date"] = str(update_data["due_date"])
    if not update_data:
        raise HTTPException(400, "No fields to update")
    res = supabase.table("udhar").update(update_data).eq("id", udhar_id).execute()
    return res.data[0]


@router.patch("/{udhar_id}/mark-paid")
def mark_paid(udhar_id: str, user=Depends(get_current_user)):
    existing = supabase.table("udhar").select("id,status").eq("id", udhar_id).eq("user_id", user["id"]).execute()
    if not existing.data:
        raise HTTPException(404, "Udhar entry not found or not yours")
    if existing.data[0]["status"] == "paid":
        raise HTTPException(400, "Already marked as paid")
    res = supabase.table("udhar").update({
        "status": "paid",
        "paid_at": datetime.now(timezone.utc).isoformat()
    }).eq("id", udhar_id).execute()
    return res.data[0]

@router.delete("/{udhar_id}")
def delete_udhar(udhar_id: str, user=Depends(get_current_user)):
    existing = supabase.table("udhar").select("id").eq("id", udhar_id).eq("user_id", user["id"]).execute()
    if not existing.data:
        raise HTTPException(404, "Udhar entry not found or not yours")
    supabase.table("udhar").delete().eq("id", udhar_id).execute()
    return {"message": "Deleted successfully"}

# ── Admin ──
@router.get("/admin/{user_id}")
def admin_get_user_udhar(user_id: str, _=Depends(require_admin)):
    res = supabase.table("udhar").select("*").eq("user_id", user_id).order("date", desc=True).execute()
    return res.data

@router.get("/admin/all/overview")
def admin_all_udhar(_=Depends(require_admin)):
    res = supabase.table("udhar").select("*, profiles(name, email)").order("date", desc=True).execute()
    return res.data
