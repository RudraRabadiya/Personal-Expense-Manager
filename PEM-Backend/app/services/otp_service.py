import random
import string
from datetime import datetime, timedelta, timezone
from app.services.supabase_client import supabase


def generate_and_save_otp(user_id: str) -> str:
    """Generate a 6-digit OTP, save it to the DB, and return the code."""
    code = ''.join(random.choices(string.digits, k=6))
    expires_at = (datetime.now(timezone.utc) + timedelta(minutes=5)).isoformat()

    # Delete any existing OTPs for this user first
    supabase.table("otp_codes").delete().eq("user_id", user_id).execute()

    # Insert the new OTP
    supabase.table("otp_codes").insert({
        "user_id": user_id,
        "code": code,
        "expires_at": expires_at,
    }).execute()

    return code


def verify_otp(user_id: str, code: str) -> bool:
    """Verify the OTP. Returns True if valid, False otherwise. Deletes after use."""
    result = supabase.table("otp_codes") \
        .select("*") \
        .eq("user_id", user_id) \
        .eq("code", code) \
        .execute()

    if not result.data:
        return False

    record = result.data[0]
    expires_at = datetime.fromisoformat(record["expires_at"].replace("Z", "+00:00"))

    if datetime.now(timezone.utc) > expires_at:
        # Expired — clean it up
        supabase.table("otp_codes").delete().eq("id", record["id"]).execute()
        return False

    # Valid — delete it so it can't be reused
    supabase.table("otp_codes").delete().eq("id", record["id"]).execute()
    return True
