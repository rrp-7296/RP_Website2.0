"""
Auth router — admin login and token management.
"""
from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.user import AdminUser
from app.schemas.auth import LoginRequest, TokenResponse
from app.middleware.auth import verify_password, create_access_token, get_current_admin
from app.config import settings

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/login", response_model=TokenResponse)
async def login(request: LoginRequest, db: AsyncSession = Depends(get_db)):
    """Authenticate admin user and return JWT token."""
    result = await db.execute(
        select(AdminUser).where(AdminUser.username == request.username)
    )
    user = result.scalar_one_or_none()

    if not user or not verify_password(request.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
        )

    expires = timedelta(minutes=settings.JWT_EXPIRATION_MINUTES)
    token = create_access_token(subject=user.username, expires_delta=expires)

    return TokenResponse(
        access_token=token,
        expires_in=settings.JWT_EXPIRATION_MINUTES * 60,
    )


@router.get("/me")
async def get_me(current_user: AdminUser = Depends(get_current_admin)):
    """Get current authenticated admin user info."""
    return {
        "id": current_user.id,
        "username": current_user.username,
        "display_name": current_user.display_name,
        "email": current_user.email,
    }
