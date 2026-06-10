from fastapi import APIRouter, Depends, Query
from app.middleware.auth_guard import get_current_user, require_admin
from app.services.supabase_client import supabase
from datetime import date
import calendar

router = APIRouter(prefix="/reports", tags=["Reports"])

def calc_monthly(entries, udhar, year, month):

    before = [e for e in entries if e["date"] < f"{year}-{month:02d}-01"]
    opening = sum(e["amount"] for e in before if e["type"]=="income") - \
              sum(e["amount"] for e in before if e["type"]=="expense")


    month_str = f"{year}-{month:02d}"
    this_month = [e for e in entries if e["date"].startswith(month_str)]
    aavak = sum(e["amount"] for e in this_month if e["type"]=="income")
    javak = sum(e["amount"] for e in this_month if e["type"]=="expense")
    closing = opening + aavak - javak


    last_day = f"{year}-{month:02d}-{calendar.monthrange(year, month)[1]}"
    udhar_gave_pending = sum(
        u["amount"] - (u.get("paid_amount") or 0)
        for u in udhar
        if u["type"] == "gave" and u["status"] != "paid" and u["date"] <= last_day
    )
    udhar_got_pending = sum(
        u["amount"] - (u.get("paid_amount") or 0)
        for u in udhar
        if u["type"] == "got" and u["status"] != "paid" and u["date"] <= last_day
    )

    return {
        "year": year, "month": month,
        "month_name": date(year, month, 1).strftime("%B"),
        "opening_balance": round(opening, 2),
        "aavak": round(aavak, 2),
        "javak": round(javak, 2),
        "closing_balance": round(closing, 2),
        "udhar_gave_pending": round(udhar_gave_pending, 2),
        "udhar_got_pending": round(udhar_got_pending, 2),
        "entries": this_month,
        "udhar_this_month": [u for u in udhar if u["date"].startswith(month_str)]
    }

def get_user_data(user_id):
    entries = supabase.table("entries").select("*").eq("user_id", user_id).order("date").execute().data or []
    udhar = supabase.table("udhar").select("*").eq("user_id", user_id).order("date").execute().data or []
    return entries, udhar


@router.get("/monthly")
def monthly_report(year: int = Query(...), month: int = Query(...), user=Depends(get_current_user)):
    entries, udhar = get_user_data(user["id"])
    return calc_monthly(entries, udhar, year, month)


@router.get("/yearly")
def yearly_report(year: int = Query(...), user=Depends(get_current_user)):
    entries, udhar = get_user_data(user["id"])
    months = []
    for m in range(1, 13):
        months.append(calc_monthly(entries, udhar, year, m))
    total_aavak = sum(m["aavak"] for m in months)
    total_javak = sum(m["javak"] for m in months)
    return {
        "year": year,
        "months": months,
        "total_aavak": round(total_aavak, 2),
        "total_javak": round(total_javak, 2),
        "net": round(total_aavak - total_javak, 2),
        "opening_balance": months[0]["opening_balance"],
        "closing_balance": months[-1]["closing_balance"]
    }


@router.get("/admin/{user_id}/monthly")
def admin_monthly(user_id: str, year: int = Query(...), month: int = Query(...), _=Depends(require_admin)):
    entries, udhar = get_user_data(user_id)
    profile = supabase.table("profiles").select("name,email").eq("id", user_id).single().execute().data
    result = calc_monthly(entries, udhar, year, month)
    result["profile"] = profile
    return result


@router.get("/admin/{user_id}/yearly")
def admin_yearly(user_id: str, year: int = Query(...), _=Depends(require_admin)):
    entries, udhar = get_user_data(user_id)
    profile = supabase.table("profiles").select("name,email").eq("id", user_id).single().execute().data
    months = []
    for m in range(1, 13):
        months.append(calc_monthly(entries, udhar, year, m))
    total_aavak = sum(m["aavak"] for m in months)
    total_javak = sum(m["javak"] for m in months)
    return {
        "year": year,
        "profile": profile,
        "months": months,
        "total_aavak": round(total_aavak, 2),
        "total_javak": round(total_javak, 2),
        "net": round(total_aavak - total_javak, 2),
        "opening_balance": months[0]["opening_balance"],
        "closing_balance": months[-1]["closing_balance"]
    }