"""Gallery image model with category tags."""
from sqlalchemy import Column, Integer, String, DateTime, Boolean, Enum as SAEnum
from sqlalchemy.sql import func
import enum

from app.database import Base


class GalleryTag(str, enum.Enum):
    """Gallery image category tags."""
    INTERNATIONAL = "international"
    INTUC = "intuc"
    UNION = "union"
    PRESS = "press"
    OTHERS = "others"
    TIMELINE = "timeline"  # Auto-added from timeline events


class GalleryImage(Base):
    __tablename__ = "gallery_images"

    id = Column(Integer, primary_key=True, autoincrement=True)
    filename = Column(String(500), nullable=False)
    original_name = Column(String(500), nullable=True)
    tag = Column(SAEnum(GalleryTag), default=GalleryTag.OTHERS, nullable=False, index=True)
    caption = Column(String(1000), nullable=True)
    # Optional link back to timeline event that created this
    source_timeline_id = Column(Integer, nullable=True)
    is_published = Column(Boolean, default=True)
    uploaded_at = Column(DateTime, server_default=func.now())
