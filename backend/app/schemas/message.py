"""Contact message schemas."""
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


class ContactMessageCreate(BaseModel):
    name: str
    email: str
    subject: str
    message: str
    date: Optional[str] = None


class ContactMessageOut(BaseModel):
    id: int
    name: str
    email: str
    subject: str
    message: str
    is_read: bool = False
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
