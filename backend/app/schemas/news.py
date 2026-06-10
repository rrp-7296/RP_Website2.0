"""News schemas."""
from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class NewsItemCreate(BaseModel):
    title: str
    text: str
    url: Optional[str] = None
    date: Optional[datetime] = None


class NewsItemUpdate(BaseModel):
    title: Optional[str] = None
    text: Optional[str] = None
    url: Optional[str] = None
    is_published: Optional[bool] = None


class NewsItemOut(BaseModel):
    id: int
    title: str
    text: str
    image: Optional[str] = None
    url: Optional[str] = None
    date: Optional[datetime] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
