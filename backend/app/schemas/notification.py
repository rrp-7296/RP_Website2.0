"""Notification schemas for API serialization."""
from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class BlogPostTitleOnly(BaseModel):
    id: int
    title: str

    class Config:
        from_attributes = True


class NotificationOut(BaseModel):
    id: int
    type: str  # "like" or "comment"
    post_id: Optional[int] = None
    item_id: Optional[int] = None
    message: str
    is_read: bool
    created_at: datetime
    post: Optional[BlogPostTitleOnly] = None

    class Config:
        from_attributes = True
