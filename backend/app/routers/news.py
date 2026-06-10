"""
News router — public endpoints.
"""
from math import ceil

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, func, desc
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.news import NewsItem
from app.schemas.news import NewsItemOut
from app.schemas.common import PaginatedResponse

router = APIRouter(prefix="/news", tags=["News"])


@router.get("", response_model=PaginatedResponse[NewsItemOut])
async def list_news(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    """Get paginated news items."""
    count_q = select(func.count()).select_from(NewsItem).where(
        NewsItem.is_published == True, NewsItem.is_deleted == False
    )
    total = (await db.execute(count_q)).scalar()

    offset = (page - 1) * limit
    query = (
        select(NewsItem)
        .where(NewsItem.is_published == True, NewsItem.is_deleted == False)
        .order_by(desc(NewsItem.date))
        .offset(offset)
        .limit(limit)
    )
    result = await db.execute(query)
    items = result.scalars().all()

    return PaginatedResponse(
        items=[NewsItemOut.model_validate(n) for n in items],
        total=total,
        page=page,
        limit=limit,
        total_pages=ceil(total / limit) if total > 0 else 0,
    )


@router.get("/{news_id}", response_model=NewsItemOut)
async def get_news(news_id: int, db: AsyncSession = Depends(get_db)):
    """Get a single news item."""
    result = await db.execute(
        select(NewsItem).where(NewsItem.id == news_id, NewsItem.is_deleted == False)
    )
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="News item not found")
    return NewsItemOut.model_validate(item)
