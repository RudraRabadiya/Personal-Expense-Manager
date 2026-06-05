from fastapi import APIRouter, HTTPException, Depends
from app.models.user import RegisterRequest, LoginRequest, UpdateProfileRequest, UpdatePasswordRequest
from app.services.supabase_client import supabase
from app.middleware.auth_guard import get_current_user

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.post("/register")
def register(body: RegisterRequest):
    try:
        res = supabase.auth.sign_up({
            "email": body.email,
            "password": body.password,
            "options": {"data": {"name": body.name, "role": "user"}}
        })
        if res.user is None:
            raise HTTPException(400, "Registration failed. Email may already be in use.")
        return {"message": "Registered successfully. Please verify your email.", "user_id": res.user.id}
    except Exception as e:
        raise HTTPException(400, str(e))

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
        # Supabase admin client updates password by user ID
        supabase.auth.admin.update_user_by_id(
            user["id"],
            {"password": body.new_password}
        )
        return {"message": "Password updated successfully"}
    except Exception as e:
        raise HTTPException(500, f"Password update failed: {str(e)}")