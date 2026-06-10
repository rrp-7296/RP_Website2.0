"""Timeline schemas."""
from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class TimelineEventCreate(BaseModel):
    text: str
    location: Optional[str] = None
    date: Optional[datetime] = None
    add_to_gallery: bool = True


class TimelineEventUpdate(BaseModel):
    text: Optional[str] = None
    location: Optional[str] = None
    date: Optional[datetime] = None
    is_published: Optional[bool] = None


class TimelineEventOut(BaseModel):
    id: int
    text: str
    image: Optional[str] = None
    location: Optional[str] = None
    date: Optional[datetime] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
