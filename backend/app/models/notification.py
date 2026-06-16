"""Notification model for storing admin dashboard alerts."""
from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, autoincrement=True)
    type = Column(String(50), nullable=False)  # "like" or "comment"
    post_id = Column(Integer, ForeignKey("blog_posts.id", ondelete="CASCADE"), nullable=True)
    item_id = Column(Integer, nullable=True)  # reference to comment_id or like_id
    message = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, server_default=func.now())

    # Relationship to fetch related blog post information if available
    post = relationship("BlogPost", lazy="selectin")
