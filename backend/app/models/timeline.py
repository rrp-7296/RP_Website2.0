"""Timeline event model — activities, events, appearances."""
from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean
from sqlalchemy.sql import func

from app.database import Base


class TimelineEvent(Base):
    __tablename__ = "timeline_events"

    id = Column(Integer, primary_key=True, autoincrement=True)
    text = Column(Text, nullable=False)
    image = Column(String(500), nullable=True)
    location = Column(String(300), nullable=True)
    date = Column(DateTime, nullable=True)
    is_published = Column(Boolean, default=True)
    is_deleted = Column(Boolean, default=False)
    # Auto-add to gallery when created
    add_to_gallery = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
