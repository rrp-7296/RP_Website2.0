"""
SQLAlchemy async database engine, session factory, and base model.
"""
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase

from sqlalchemy import text
from app.config import settings

# Async engine for MySQL 8.0 via aiomysql
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.DB_ECHO,
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20,
)

# Session factory
async_session = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


class Base(DeclarativeBase):
    """Declarative base for all ORM models."""
    pass


async def get_db() -> AsyncSession:
    """FastAPI dependency: yields a database session per request."""
    async with async_session() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


async def init_db():
    """Create all tables (for development only; use Alembic in production)."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        
        # Dynamic migration check to add reply columns to contact_messages if they are missing
        try:
            if "sqlite" in settings.DATABASE_URL:
                cursor = await conn.execute(text("PRAGMA table_info(contact_messages)"))
                columns = [row[1] for row in cursor.fetchall()]
            else:
                cursor = await conn.execute(text("SHOW COLUMNS FROM contact_messages"))
                columns = [row[0] for row in cursor.fetchall()]
            
            if "reply_message" not in columns:
                await conn.execute(text("ALTER TABLE contact_messages ADD COLUMN reply_message TEXT"))
            if "replied_at" not in columns:
                await conn.execute(text("ALTER TABLE contact_messages ADD COLUMN replied_at DATETIME"))
            if "is_replied" not in columns:
                await conn.execute(text("ALTER TABLE contact_messages ADD COLUMN is_replied BOOLEAN DEFAULT 0"))
        except Exception as e:
            print(f"Database migration check failed: {e}")

