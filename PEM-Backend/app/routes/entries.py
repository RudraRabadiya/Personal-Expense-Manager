from fastapi import APIRouter, Depends, HTTPException
from app.models.entry import EntryCreate, EntryUpdate
from app.middleware.auth_guard import get_current_user, require_admin
from app.services.supabase_client import supabase

router = APIRouter(prefix="/entries", tags=["Entries"])

@router.get("/")
def get_entries(user=Depends(get_current_user)):
    res = supabase.table("entries").select("*").eq("user_id", user["id"]).order("date", desc=True).execute()
    return res.data

@router.post("/")
def create_entry(body: EntryCreate, user=Depends(get_current_user)):
    if body.type not in ("expense", "income"):
        raise HTTPException(400, "Type must be 'expense' or 'income'")
    res = supabase.table("entries").insert({**body.model_dump(), "user_id": user["id"], "date": str(body.date)}).execute()
    return res.data[0]

@router.put("/{entry_id}")
def update_entry(entry_id: str, body: EntryUpdate, user=Depends(get_current_user)):
    existing = supabase.table("entries").select("id").eq("id", entry_id).eq("user_id", user["id"]).execute()
    if not existing.data:
        raise HTTPException(404, "Entry not found or not yours")
    update_data = {k: v for k, v in body.model_dump().items() if v is not None}
    if "date" in update_data:
        update_data["date"] = str(update_data["date"])
    res = supabase.table("entries").update(update_data).eq("id", entry_id).execute()
    return res.data[0]

@router.delete("/{entry_id}")
def delete_entry(entry_id: str, user=Depends(get_current_user)):
    existing = supabase.table("entries").select("id").eq("id", entry_id).eq("user_id", user["id"]).execute()
    if not existing.data:
        raise HTTPException(404, "Entry not found or not yours")
    supabase.table("entries").delete().eq("id", entry_id).execute()
    return {"message": "Deleted successfully"}

# ── Admin: get any user's entries ──
@router.get("/admin/{user_id}")
def admin_get_user_entries(user_id: str, _=Depends(require_admin)):
    res = supabase.table("entries").select("*").eq("user_id", user_id).order("date", desc=True).execute()
    return res.data

@router.get("/admin/all/summary")
def admin_all_entries(_=Depends(require_admin)):
    res = supabase.table("entries").select("*, profiles(name, email)").order("date", desc=True).execute()
    return res.data
