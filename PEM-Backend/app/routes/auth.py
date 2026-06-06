from fastapi import APIRouter, HTTPException, Depends
from app.models.user import RegisterRequest, LoginRequest, OtpVerifyRequest, UpdateProfileRequest, UpdatePasswordRequest
from app.services.supabase_client import supabase
from app.services.otp_service import generate_and_save_otp, verify_otp
from app.services.email_service import send_otp_email
from app.middleware.auth_guard import get_current_user

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/register")
def register(body: RegisterRequest):
    """Step 1: Create account (unverified) and send OTP to email."""
    try:
        res = supabase.auth.sign_up({
            "email": body.email,
            "password": body.password,
            "options": {"data": {"name": body.name, "role": "user"}}
        })
        if res.user is None:
            raise HTTPException(400, "Registration failed. Email may already be in use.")
    except Exception as e:
        raise HTTPException(400, str(e))

    user_id = res.user.id

    # Generate OTP and send email
    try:
        otp_code = generate_and_save_otp(user_id)
        send_otp_email(to_email=body.email, name=body.name, otp_code=otp_code)
    except Exception as e:
        raise HTTPException(500, f"Failed to send OTP email: {str(e)}")

    return {
        "message": "Account created. Please check your email for the verification code.",
        "user_id": user_id,
        "otp_sent": True
    }


@router.post("/verify-registration")
def verify_registration(body: OtpVerifyRequest):
    """Step 2: Verify OTP, mark account as verified, and return JWT token."""
    is_valid = verify_otp(user_id=body.user_id, code=body.code)
    if not is_valid:
        raise HTTPException(400, "Invalid or expired verification code.")

    # Mark profile as verified
    try:
        supabase.table("profiles").update({"is_verified": True}).eq("id", body.user_id).execute()
    except Exception as e:
        raise HTTPException(500, f"Failed to verify account: {str(e)}")

    # Log the user in by creating a session
    try:
        profile = supabase.table("profiles").select("*").eq("id", body.user_id).single().execute()
        # Get user email from auth
        auth_user = supabase.auth.admin.get_user_by_id(body.user_id)
        # Sign in to get a session token
        session = supabase.auth.admin.create_user({
            "email": auth_user.user.email,
            "email_confirm": True,
        })
    except Exception:
        pass

    # Generate a sign-in link / use service role to get token
    try:
        sign_in = supabase.auth.admin.generate_link({
            "type": "magiclink",
            "email": supabase.auth.admin.get_user_by_id(body.user_id).user.email,
        })
        access_token = sign_in.properties.action_link
    except Exception:
        access_token = None

    return {
        "message": "Email verified successfully! You can now log in.",
        "verified": True,
    }


@router.post("/resend-otp")
def resend_otp(body: dict):
    """Resend OTP to the user's email."""
    user_id = body.get("user_id")
    if not user_id:
        raise HTTPException(400, "user_id is required")

    try:
        auth_user = supabase.auth.admin.get_user_by_id(user_id)
        if not auth_user.user:
            raise HTTPException(404, "User not found")

        name = auth_user.user.user_metadata.get("name", "User")
        email = auth_user.user.email

        otp_code = generate_and_save_otp(user_id)
        send_otp_email(to_email=email, name=name, otp_code=otp_code)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, f"Failed to resend OTP: {str(e)}")

    return {"message": "New verification code sent to your email.", "otp_sent": True}


@router.post("/login")
def login(body: LoginRequest):
    try:
        res = supabase.auth.sign_in_with_password({"email": body.email, "password": body.password})
    except Exception as e:
        raise HTTPException(401, f"Login failed: {str(e)}")

    if not res.user or not res.session:
        raise HTTPException(401, "Invalid email or password")

    try:
        profile = supabase.table("profiles").select("*").eq("id", res.user.id).single().execute()
    except Exception as e:
        raise HTTPException(500, f"Profile fetch failed: {str(e)}")

    # Block unverified users
    if not profile.data.get("is_verified", False):
        raise HTTPException(403, "Please verify your email before logging in. Check your inbox for the verification code.")

    return {
        "access_token": res.session.access_token,
        "user": profile.data
    }


@router.get("/me")
def me(user=Depends(get_current_user)):
    return user


@router.patch("/profile")
def update_profile(body: UpdateProfileRequest, user=Depends(get_current_user)):
    try:
        supabase.table("profiles").update({"name": body.name}).eq("id", user["id"]).execute()
        return {"message": "Profile updated successfully"}
    except Exception as e:
        raise HTTPException(500, f"Profile update failed: {str(e)}")


@router.patch("/password")
def update_password(body: UpdatePasswordRequest, user=Depends(get_current_user)):
    try:
        supabase.auth.admin.update_user_by_id(
            user["id"],
            {"password": body.new_password}
        )
        return {"message": "Password updated successfully"}
    except Exception as e:
        raise HTTPException(500, f"Password update failed: {str(e)}")