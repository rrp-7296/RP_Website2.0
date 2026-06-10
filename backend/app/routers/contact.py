"""
Contact & subscription routers — public endpoints.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel

from app.database import get_db
from app.models.message import ContactMessage
from app.models.subscription import Subscription
from app.schemas.message import ContactMessageCreate
from app.schemas.common import MessageResponse
from app.services.email_service import send_contact_notification

router = APIRouter(tags=["Contact"])


class SubscriptionCreate(BaseModel):
    email: str


@router.post("/contact", response_model=MessageResponse)
async def submit_contact(data: ContactMessageCreate, db: AsyncSession = Depends(get_db)):
    """Submit a contact form message."""
    msg = ContactMessage(
        name=data.name,
        email=data.email,
        subject=data.subject,
        message=data.message,
    )
    db.add(msg)
    await db.flush()

    # Send email notification (non-blocking, don't fail if email fails)
    await send_contact_notification(
        name=data.name,
        email=data.email,
        subject=data.subject,
        message=data.message,
    )

    return MessageResponse(message="Thank you! Your message has been submitted successfully.")


@router.post("/messages", response_model=MessageResponse)
async def submit_contact_messages(data: ContactMessageCreate, db: AsyncSession = Depends(get_db)):
    """Submit a contact form message (alternative endpoint matching frontend)."""
    return await submit_contact(data, db)


@router.post("/subscribe", response_model=MessageResponse)
async def subscribe(email: str, db: AsyncSession = Depends(get_db)):
    """Subscribe to the newsletter."""
    # Check if already subscribed
    existing = await db.execute(
        select(Subscription).where(Subscription.email == email)
    )
    if existing.scalar_one_or_none():
        return MessageResponse(message="You are already subscribed!", success=True)

    sub = Subscription(email=email)
    db.add(sub)

    return MessageResponse(message="You are subscribed! Thank you.")


@router.post("/subscriptions", response_model=MessageResponse)
async def subscribe_json(data: SubscriptionCreate, db: AsyncSession = Depends(get_db)):
    """Subscribe to the newsletter (JSON body endpoint matching frontend)."""
    return await subscribe(data.email, db)
