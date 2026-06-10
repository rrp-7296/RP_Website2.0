"""Blog models — posts, comments, and likes."""
from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base


class BlogPost(Base):
    __tablename__ = "blog_posts"

    id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String(500), nullable=False)
    description = Column(Text, nullable=True)  # Short excerpt
    main_body = Column(Text, nullable=False)
    image = Column(String(500), nullable=True)
    date = Column(DateTime, server_default=func.now())
    likes_count = Column(Integer, default=0)
    view_count = Column(Integer, default=0)
    is_published = Column(Boolean, default=True)
    is_deleted = Column(Boolean, default=False)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    # Relationships
    comments = relationship("BlogComment", back_populates="post", lazy="selectin")
    likes = relationship("BlogLike", back_populates="post", lazy="selectin")


class BlogComment(Base):
    __tablename__ = "blog_comments"

    id = Column(Integer, primary_key=True, autoincrement=True)
    post_id = Column(Integer, ForeignKey("blog_posts.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(200), nullable=False)
    email = Column(String(255), nullable=True)
    comment = Column(Text, nullable=False)
    is_approved = Column(Boolean, default=False)
    created_at = Column(DateTime, server_default=func.now())

    # Relationships
    post = relationship("BlogPost", back_populates="comments")


class BlogLike(Base):
    __tablename__ = "blog_likes"

    id = Column(Integer, primary_key=True, autoincrement=True)
    post_id = Column(Integer, ForeignKey("blog_posts.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(200), default="Anonymous")
    created_at = Column(DateTime, server_default=func.now())

    # Relationships
    post = relationship("BlogPost", back_populates="likes")
