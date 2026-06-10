"""Gallery schemas."""
from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class GalleryImageOut(BaseModel):
    id: int
    filename: str
    original_name: Optional[str] = None
    tag: str
    caption: Optional[str] = None
    source_timeline_id: Optional[int] = None
    uploaded_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class GalleryUploadResponse(BaseModel):
    id: int
    filename: str
    tag: str
    message: str = "Image uploaded successfully"
