"""Page metrics / analytics model."""
from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func

from app.database import Base


class PageMetric(Base):
    __tablename__ = "page_metrics"

    id = Column(Integer, primary_key=True, autoincrement=True)
    page_name = Column(String(100), unique=True, nullable=False, index=True)
    hits = Column(Integer, default=0)
    last_hit_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
