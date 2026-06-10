"""
Gallery router — public endpoints with tag filtering.
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional

from app.database import get_db
from app.models.gallery import GalleryImage
from app.schemas.gallery import GalleryImageOut

router = APIRouter(prefix="/gallery", tags=["Gallery"])


@router.get("", response_model=list[GalleryImageOut])
async def list_gallery(
    tag: Optional[str] = Query(None, description="Filter by tag"),
    limit: int = Query(50, ge=1, le=200),
    db: AsyncSession = Depends(get_db),
):
    """Get gallery images, optionally filtered by tag."""
    query = select(GalleryImage).where(GalleryImage.is_published == True)

    if tag and tag.lower() != "all":
        query = query.where(GalleryImage.tag == tag.lower())

    query = query.order_by(desc(GalleryImage.uploaded_at)).limit(limit)
    result = await db.execute(query)
    images = result.scalars().all()

    return [GalleryImageOut.model_validate(img) for img in images]


@router.get("/tags")
async def get_gallery_tags():
    """Get available gallery tag categories."""
    return {
        "tags": [
            {"value": "all", "label": "All"},
            {"value": "international", "label": "International"},
            {"value": "intuc", "label": "INTUC"},
            {"value": "union", "label": "Unions"},
            {"value": "press", "label": "Press Release"},
            {"value": "timeline", "label": "Timeline"},
            {"value": "others", "label": "Others"},
        ]
    }
