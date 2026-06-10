"""Blog schemas for request/response serialization."""
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


# --- Blog Post ---
class BlogPostBase(BaseModel):
    title: str
    description: Optional[str] = None
    main_body: str


class BlogPostCreate(BlogPostBase):
    pass


class BlogPostUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    main_body: Optional[str] = None
    is_published: Optional[bool] = None


class BlogCommentOut(BaseModel):
    id: int
    name: str
    comment: str
    created_at: datetime

    class Config:
        from_attributes = True


class BlogPostOut(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    main_body: str
    image: Optional[str] = None
    date: Optional[datetime] = None
    likes_count: int = 0
    view_count: int = 0
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class BlogPostDetail(BlogPostOut):
    """Full post with approved comments."""
    comments: List[BlogCommentOut] = []


class BlogPostListItem(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    image: Optional[str] = None
    date: Optional[datetime] = None
    likes_count: int = 0
    view_count: int = 0

    class Config:
        from_attributes = True


# --- Comment ---
class CommentCreate(BaseModel):
    name: str
    email: Optional[str] = None
    comment: str


# --- Like ---
class LikeCreate(BaseModel):
    name: str = "Anonymous"
