from fastapi import APIRouter, HTTPException, Body
from pydantic import BaseModel, EmailStr
from typing import Optional
from ...services.auth_service import register_user, authenticate_user, get_user_profile

router = APIRouter(prefix="/auth", tags=["Authentication"])

class SignupSchema(BaseModel):
    name: str
    email: str
    password: str
    role: Optional[str] = "Data Analyst"

class LoginSchema(BaseModel):
    email: str
    password: str

@router.post("/signup")
async def signup(payload: SignupSchema):
    try:
        user_data = register_user(
            name=payload.name,
            email=payload.email,
            password=payload.password,
            role=payload.role or "Data Analyst"
        )
        return {"success": True, "data": user_data, "message": "User registered successfully"}
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Signup failed: {str(e)}")

@router.post("/login")
async def login(payload: LoginSchema):
    try:
        user_data = authenticate_user(email=payload.email, password=payload.password)
        return {"success": True, "data": user_data, "message": "Login successful"}
    except ValueError as ve:
        raise HTTPException(status_code=401, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Login failed: {str(e)}")

@router.get("/me")
async def get_current_user(email: str):
    try:
        profile = get_user_profile(email)
        if not profile:
            raise HTTPException(status_code=404, detail="User not found")
        return {"success": True, "data": profile, "message": "User profile fetched successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching profile: {str(e)}")
