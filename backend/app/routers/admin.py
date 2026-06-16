"""
Admin router — protected CRUD endpoints for blog, timeline, news, gallery, messages, comments.
"""
from math import ceil

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query
from sqlalchemy import select, func, desc
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional

from app.database import get_db
from app.models.user import AdminUser
from app.models.blog import BlogPost, BlogComment
from app.models.timeline import TimelineEvent
from app.models.news import NewsItem
from app.models.gallery import GalleryImage, GalleryTag
from app.models.message import ContactMessage
from app.models.subscription import Subscription
from app.models.metrics import PageMetric
from app.models.notification import Notification
from app.middleware.auth import get_current_admin
from app.services.file_service import save_upload, delete_upload
from app.services.email_service import send_contact_reply
from app.schemas.common import MessageResponse
from app.schemas.notification import NotificationOut
from app.schemas.message import ContactMessageReply


router = APIRouter(prefix="/admin", tags=["Admin"], dependencies=[Depends(get_current_admin)])


# ─── Dashboard Stats ────────────────────────────────────────────────
@router.get("/stats")
async def dashboard_stats(db: AsyncSession = Depends(get_db)):
    """Get dashboard statistics."""
    total_blogs = (await db.execute(select(func.count()).select_from(BlogPost).where(BlogPost.is_deleted == False))).scalar()
    total_timeline = (await db.execute(select(func.count()).select_from(TimelineEvent).where(TimelineEvent.is_deleted == False))).scalar()
    total_news = (await db.execute(select(func.count()).select_from(NewsItem).where(NewsItem.is_deleted == False))).scalar()
    total_gallery = (await db.execute(select(func.count()).select_from(GalleryImage))).scalar()
    unread_messages = (await db.execute(select(func.count()).select_from(ContactMessage).where(ContactMessage.is_read == False, ContactMessage.is_deleted == False))).scalar()
    pending_comments = (await db.execute(select(func.count()).select_from(BlogComment).where(BlogComment.is_approved == False))).scalar()
    total_subscribers = (await db.execute(select(func.count()).select_from(Subscription))).scalar()
    unread_notifications = (await db.execute(select(func.count()).select_from(Notification).where(Notification.is_read == False))).scalar()

    return {
        "total_blogs": total_blogs,
        "total_timeline": total_timeline,
        "total_news": total_news,
        "total_gallery": total_gallery,
        "unread_messages": unread_messages,
        "pending_comments": pending_comments,
        "total_subscribers": total_subscribers,
        "unread_notifications": unread_notifications,
    }


# ─── Blog CRUD ──────────────────────────────────────────────────────
@router.post("/blogs")
async def create_blog(
    title: str = Form(...),
    description: str = Form(""),
    main_body: str = Form(...),
    image: Optional[UploadFile] = File(None),
    db: AsyncSession = Depends(get_db),
):
    """Create a new blog post with optional image upload."""
    filename = None
    if image:
        filename = await save_upload(image, "blog")

    post = BlogPost(title=title, description=description, main_body=main_body, image=filename)
    db.add(post)
    await db.flush()
    return {"id": post.id, "message": "Blog post created successfully"}


@router.put("/blogs/{post_id}")
async def update_blog(
    post_id: int,
    title: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    main_body: Optional[str] = Form(None),
    is_published: Optional[bool] = Form(None),
    image: Optional[UploadFile] = File(None),
    db: AsyncSession = Depends(get_db),
):
    """Update a blog post."""
    result = await db.execute(select(BlogPost).where(BlogPost.id == post_id))
    post = result.scalar_one_or_none()
    if not post:
        raise HTTPException(status_code=404, detail="Blog post not found")

    if title is not None: post.title = title
    if description is not None: post.description = description
    if main_body is not None: post.main_body = main_body
    if is_published is not None: post.is_published = is_published
    if image:
        if post.image:
            delete_upload(post.image, "blog")
        post.image = await save_upload(image, "blog")

    return {"id": post.id, "message": "Blog post updated successfully"}


@router.delete("/blogs/{post_id}")
async def delete_blog(post_id: int, db: AsyncSession = Depends(get_db)):
    """Soft-delete a blog post."""
    result = await db.execute(select(BlogPost).where(BlogPost.id == post_id))
    post = result.scalar_one_or_none()
    if not post:
        raise HTTPException(status_code=404, detail="Blog post not found")
    post.is_deleted = True
    return MessageResponse(message="Blog post deleted")


# ─── Timeline CRUD ──────────────────────────────────────────────────
@router.post("/timeline")
async def create_timeline(
    text: str = Form(...),
    location: str = Form(""),
    add_to_gallery: bool = Form(True),
    image: Optional[UploadFile] = File(None),
    db: AsyncSession = Depends(get_db),
):
    """Create a timeline event with optional auto-add to gallery."""
    filename = None
    if image:
        filename = await save_upload(image, "timeline")

    event = TimelineEvent(text=text, location=location, image=filename, add_to_gallery=add_to_gallery)
    db.add(event)
    await db.flush()

    # Auto-add to gallery if flagged
    if add_to_gallery and filename:
        gallery_img = GalleryImage(
            filename=filename,
            tag=GalleryTag.TIMELINE,
            caption=text[:200] if text else None,
            source_timeline_id=event.id,
        )
        db.add(gallery_img)

    return {"id": event.id, "message": "Timeline event created successfully"}


@router.delete("/timeline/{event_id}")
async def delete_timeline(event_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(TimelineEvent).where(TimelineEvent.id == event_id))
    event = result.scalar_one_or_none()
    if not event:
        raise HTTPException(status_code=404, detail="Timeline event not found")
    event.is_deleted = True
    return MessageResponse(message="Timeline event deleted")


# ─── News CRUD ──────────────────────────────────────────────────────
@router.post("/news")
async def create_news(
    title: str = Form(...),
    text: str = Form(...),
    url: str = Form(""),
    image: Optional[UploadFile] = File(None),
    db: AsyncSession = Depends(get_db),
):
    filename = None
    if image:
        filename = await save_upload(image, "news")
    item = NewsItem(title=title, text=text, url=url, image=filename)
    db.add(item)
    await db.flush()
    return {"id": item.id, "message": "News item created successfully"}


@router.delete("/news/{news_id}")
async def delete_news(news_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(NewsItem).where(NewsItem.id == news_id))
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="News item not found")
    item.is_deleted = True
    return MessageResponse(message="News item deleted")


# ─── Gallery Management ────────────────────────────────────────────
@router.post("/gallery")
async def upload_gallery_image(
    tag: str = Form("others"),
    caption: str = Form(""),
    image: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
):
    filename = await save_upload(image, "gallery")
    gallery_img = GalleryImage(
        filename=filename,
        original_name=image.filename,
        tag=tag,
        caption=caption,
    )
    db.add(gallery_img)
    await db.flush()
    return {"id": gallery_img.id, "filename": filename, "message": "Image uploaded successfully"}


@router.delete("/gallery/{image_id}")
async def delete_gallery_image(image_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(GalleryImage).where(GalleryImage.id == image_id))
    img = result.scalar_one_or_none()
    if not img:
        raise HTTPException(status_code=404, detail="Image not found")
    delete_upload(img.filename, "gallery")
    await db.delete(img)
    return MessageResponse(message="Image deleted")


# ─── Messages ──────────────────────────────────────────────────────
@router.get("/messages")
async def list_messages(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    offset = (page - 1) * limit
    query = (
        select(ContactMessage)
        .where(ContactMessage.is_deleted == False)
        .order_by(desc(ContactMessage.created_at))
        .offset(offset)
        .limit(limit)
    )
    result = await db.execute(query)
    messages = result.scalars().all()
    total = (await db.execute(select(func.count()).select_from(ContactMessage).where(ContactMessage.is_deleted == False))).scalar()
    return {"items": messages, "total": total, "page": page}


@router.patch("/messages/{msg_id}/read")
async def mark_message_read(msg_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(ContactMessage).where(ContactMessage.id == msg_id))
    msg = result.scalar_one_or_none()
    if not msg:
        raise HTTPException(status_code=404, detail="Message not found")
    msg.is_read = True
    return MessageResponse(message="Message marked as read")


@router.post("/messages/{msg_id}/reply", response_model=MessageResponse)
async def reply_to_message(
    msg_id: int,
    data: ContactMessageReply,
    db: AsyncSession = Depends(get_db),
):
    """Reply to a contact form message via email and save status."""
    result = await db.execute(select(ContactMessage).where(ContactMessage.id == msg_id))
    msg = result.scalar_one_or_none()
    if not msg:
        raise HTTPException(status_code=404, detail="Message not found")

    # Send email
    success = await send_contact_reply(
        to_email=msg.email,
        to_name=msg.name,
        original_subject=msg.subject,
        reply_body=data.reply_message,
    )

    if not success:
        raise HTTPException(status_code=500, detail="Failed to send email. Check SMTP settings.")

    # Update database
    msg.is_replied = True
    msg.reply_message = data.reply_message
    msg.replied_at = func.now()
    msg.is_read = True  # Automatically mark as read if replied

    return MessageResponse(message="Reply email sent successfully and recorded.")



# ─── Comments Management ──────────────────────────────────────────
@router.get("/comments")
async def list_pending_comments(db: AsyncSession = Depends(get_db)):
    query = select(BlogComment).where(BlogComment.is_approved == False).order_by(desc(BlogComment.created_at))
    result = await db.execute(query)
    return result.scalars().all()


@router.patch("/comments/{comment_id}/approve")
async def approve_comment(comment_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(BlogComment).where(BlogComment.id == comment_id))
    comment = result.scalar_one_or_none()
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    comment.is_approved = True
    return MessageResponse(message="Comment approved")


@router.delete("/comments/{comment_id}")
async def delete_comment(comment_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(BlogComment).where(BlogComment.id == comment_id))
    comment = result.scalar_one_or_none()
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    await db.delete(comment)
    return MessageResponse(message="Comment deleted")


# ─── Notifications Management ──────────────────────────────────────
@router.get("/notifications", response_model=list[NotificationOut])
async def list_notifications(db: AsyncSession = Depends(get_db)):
    """List all notifications."""
    query = select(Notification).order_by(desc(Notification.created_at))
    result = await db.execute(query)
    return result.scalars().all()


@router.patch("/notifications/{notif_id}/read", response_model=MessageResponse)
async def mark_notification_read(notif_id: int, db: AsyncSession = Depends(get_db)):
    """Mark a specific notification as read."""
    result = await db.execute(select(Notification).where(Notification.id == notif_id))
    notif = result.scalar_one_or_none()
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")
    notif.is_read = True
    return MessageResponse(message="Notification marked as read")


@router.post("/notifications/read-all", response_model=MessageResponse)
async def mark_all_notifications_read(db: AsyncSession = Depends(get_db)):
    """Mark all notifications as read."""
    from sqlalchemy import update
    await db.execute(update(Notification).where(Notification.is_read == False).values(is_read=True))
    return MessageResponse(message="All notifications marked as read")


@router.delete("/notifications/{notif_id}", response_model=MessageResponse)
async def delete_notification(notif_id: int, db: AsyncSession = Depends(get_db)):
    """Delete a specific notification."""
    result = await db.execute(select(Notification).where(Notification.id == notif_id))
    notif = result.scalar_one_or_none()
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")
    await db.delete(notif)
    return MessageResponse(message="Notification deleted")
