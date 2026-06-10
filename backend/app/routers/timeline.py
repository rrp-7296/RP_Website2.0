"""
Timeline router — public endpoints.
"""
from math import ceil

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select, func, desc
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.timeline import TimelineEvent
from app.schemas.timeline import TimelineEventOut
from app.schemas.common import PaginatedResponse

router = APIRouter(prefix="/timeline", tags=["Timeline"])


@router.get("", response_model=PaginatedResponse[TimelineEventOut])
async def list_timeline(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    """Get paginated timeline events."""
    count_q = select(func.count()).select_from(TimelineEvent).where(
        TimelineEvent.is_published == True, TimelineEvent.is_deleted == False
    )
    total = (await db.execute(count_q)).scalar()

    offset = (page - 1) * limit
    query = (
        select(TimelineEvent)
        .where(TimelineEvent.is_published == True, TimelineEvent.is_deleted == False)
        .order_by(desc(TimelineEvent.date))
        .offset(offset)
        .limit(limit)
    )
    result = await db.execute(query)
    events = result.scalars().all()

    return PaginatedResponse(
        items=[TimelineEventOut.model_validate(e) for e in events],
        total=total,
        page=page,
        limit=limit,
        total_pages=ceil(total / limit) if total > 0 else 0,
    )
