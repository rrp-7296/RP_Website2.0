"""
Rakeshwar Pandey Portfolio — FastAPI Application
Main entry point that assembles all routers, middleware, and static file serving.
"""
import os
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.database import init_db
from app.routers import auth, blog, timeline, news, gallery, contact, admin


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan — setup and teardown."""
    # Create upload directories
    for subfolder in ["blog", "timeline", "news", "gallery"]:
        Path(settings.UPLOAD_DIR, subfolder).mkdir(parents=True, exist_ok=True)

    # Create tables (dev only; use Alembic migrations in production)
    if settings.DEBUG:
        await init_db()

    yield  # App runs here

    # Cleanup (if needed)


# Create FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    description="Portfolio website API for Rakeshwar Pandey — Social Leader & President, INTUC Jharkhand",
    version="2.0.0",
    lifespan=lifespan,
    docs_url="/api/docs" if settings.DEBUG else None,
    redoc_url="/api/redoc" if settings.DEBUG else None,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount uploaded files as static
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Include API routers under /api prefix
app.include_router(auth.router, prefix="/api")
app.include_router(blog.router, prefix="/api")
app.include_router(timeline.router, prefix="/api")
app.include_router(news.router, prefix="/api")
app.include_router(gallery.router, prefix="/api")
app.include_router(contact.router, prefix="/api")
app.include_router(admin.router, prefix="/api")


# Serve React SPA in production
# The built React app (ui/dist/) is served as static files
# All non-API routes fall through to index.html for client-side routing
SPA_DIR = Path(__file__).parent.parent.parent / "ui" / "dist"

if SPA_DIR.exists():
    app.mount("/", StaticFiles(directory=str(SPA_DIR), html=True), name="spa")


@app.get("/api/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "app": settings.APP_NAME, "version": "2.0.0"}
