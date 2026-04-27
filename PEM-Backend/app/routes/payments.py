from fastapi import APIRouter, Depends, HTTPException
from app.models.payment import PaymentCreate
from app.middleware.auth_guard import get_current_user
from app.services.supabase_client import supabase

router = APIRouter(prefix="/udhar/{udhar_id}/payments", tags=["Payments"])

def get_udhar_or_404(udhar_id: str, user_id: str):
    res = supabase.table("udhar").select("*").eq("id", udhar_id).eq("user_id", user_id).execute()
    if not res.data:
        raise HTTPException(404, "Udhar entry not found or not yours")
    return res.data[0]

def recalculate_status(udhar_id: str, total_amount: float):
    """Auto mark as paid if payments cover full amount"""
    payments = supabase.table("udhar_payments").select("amount").eq("udhar_id", udhar_id).execute()
    paid_total = sum(p["amount"] for p in (payments.data or []))
    new_status = "paid" if paid_total >= total_amount else "partial" if paid_total > 0 else "pending"
    supabase.table("udhar").update({"status": new_status, "paid_amount": paid_total}).eq("id", udhar_id).execute()
    return paid_total, new_status

@router.get("/")
def get_payments(udhar_id: str, user=Depends(get_current_user)):
    get_udhar_or_404(udhar_id, user["id"])
    res = supabase.table("udhar_payments").select("*").eq("udhar_id", udhar_id).order("date", desc=True).execute()
    return res.data

@router.post("/")
def add_payment(udhar_id: str, body: PaymentCreate, user=Depends(get_current_user)):
    udhar = get_udhar_or_404(udhar_id, user["id"])
    if udhar["status"] == "paid":
        raise HTTPException(400, "This udhar is already fully paid")
    if body.amount <= 0:
        raise HTTPException(400, "Payment amount must be greater than 0")

    # Check overpayment
    payments = supabase.table("udhar_payments").select("amount").eq("udhar_id", udhar_id).execute()
    already_paid = sum(p["amount"] for p in (payments.data or []))
    remaining = udhar["amount"] - already_paid
    if body.amount > remaining:
        raise HTTPException(400, f"Payment ₹{body.amount} exceeds remaining amount ₹{remaining:.2f}")

    res = supabase.table("udhar_payments").insert({
        "udhar_id": udhar_id,
        "amount": body.amount,
        "date": str(body.date),
        "notes": body.notes
    }).execute()

    paid_total, new_status = recalculate_status(udhar_id, udhar["amount"])
    return {
        "payment": res.data[0],
        "paid_total": paid_total,
        "remaining": udhar["amount"] - paid_total,
        "status": new_status
    }

@router.delete("/{payment_id}")
def delete_payment(udhar_id: str, payment_id: str, user=Depends(get_current_user)):
    udhar = get_udhar_or_404(udhar_id, user["id"])
    supabase.table("udhar_payments").delete().eq("id", payment_id).execute()
    paid_total, new_status = recalculate_status(udhar_id, udhar["amount"])
    return {"message": "Payment deleted", "paid_total": paid_total, "status": new_status}