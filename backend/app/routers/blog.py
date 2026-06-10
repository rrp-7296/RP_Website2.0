"""
Blog router — public endpoints for blog posts, comments, and likes.
"""
from math import ceil

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, func, desc
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.blog import BlogPost, BlogComment, BlogLike
from app.schemas.blog import (
    BlogPostListItem, BlogPostDetail, BlogCommentOut,
    CommentCreate, LikeCreate,
)
from app.schemas.common import PaginatedResponse, MessageResponse

router = APIRouter(prefix="/blogs", tags=["Blog"])


@router.get("", response_model=PaginatedResponse[BlogPostListItem])
async def list_blogs(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    """Get paginated list of published blog posts."""
    # Count total
    count_q = select(func.count()).select_from(BlogPost).where(
        BlogPost.is_published == True, BlogPost.is_deleted == False
    )
    total = (await db.execute(count_q)).scalar()

    # Fetch page
    offset = (page - 1) * limit
    query = (
        select(BlogPost)
        .where(BlogPost.is_published == True, BlogPost.is_deleted == False)
        .order_by(desc(BlogPost.date))
        .offset(offset)
        .limit(limit)
    )
    result = await db.execute(query)
    posts = result.scalars().all()

    return PaginatedResponse(
        items=[BlogPostListItem.model_validate(p) for p in posts],
        total=total,
        page=page,
        limit=limit,
        total_pages=ceil(total / limit) if total > 0 else 0,
    )


@router.get("/popular", response_model=list[BlogPostListItem])
async def popular_blogs(
    limit: int = Query(3, ge=1, le=10),
    db: AsyncSession = Depends(get_db),
):
    """Get most popular blog posts by likes."""
    query = (
        select(BlogPost)
        .where(BlogPost.is_published == True, BlogPost.is_deleted == False)
        .order_by(desc(BlogPost.likes_count))
        .limit(limit)
    )
    result = await db.execute(query)
    return [BlogPostListItem.model_validate(p) for p in result.scalars().all()]


@router.get("/{post_id}", response_model=BlogPostDetail)
async def get_blog(post_id: int, db: AsyncSession = Depends(get_db)):
    """Get a single blog post with approved comments."""
    result = await db.execute(
        select(BlogPost).where(BlogPost.id == post_id, BlogPost.is_deleted == False)
    )
    post = result.scalar_one_or_none()
    if not post:
        raise HTTPException(status_code=404, detail="Blog post not found")

    # Increment view count
    post.view_count += 1
    await db.flush()

    # Get approved comments
    comments_q = (
        select(BlogComment)
        .where(BlogComment.post_id == post_id, BlogComment.is_approved == True)
        .order_by(desc(BlogComment.created_at))
    )
    comments_result = await db.execute(comments_q)
    comments = [BlogCommentOut.model_validate(c) for c in comments_result.scalars().all()]

    post_data = BlogPostDetail.model_validate(post)
    post_data.comments = comments
    return post_data


@router.post("/{post_id}/like", response_model=MessageResponse)
async def like_blog(post_id: int, data: LikeCreate, db: AsyncSession = Depends(get_db)):
    """Like a blog post."""
    result = await db.execute(select(BlogPost).where(BlogPost.id == post_id))
    post = result.scalar_one_or_none()
    if not post:
        raise HTTPException(status_code=404, detail="Blog post not found")

    like = BlogLike(post_id=post_id, name=data.name)
    db.add(like)
    post.likes_count += 1
    await db.flush()

    return MessageResponse(message=f"Post liked! Total likes: {post.likes_count}")


@router.post("/{post_id}/comments", response_model=MessageResponse)
async def add_comment(post_id: int, data: CommentCreate, db: AsyncSession = Depends(get_db)):
    """Submit a comment on a blog post (requires admin approval)."""
    result = await db.execute(select(BlogPost).where(BlogPost.id == post_id))
    post = result.scalar_one_or_none()
    if not post:
        raise HTTPException(status_code=404, detail="Blog post not found")

    comment = BlogComment(
        post_id=post_id,
        name=data.name,
        email=data.email,
        comment=data.comment,
        is_approved=False,
    )
    db.add(comment)

    return MessageResponse(message="Comment submitted! It will appear after approval.")
