"""
File upload service — handles image uploads with validation and thumbnails.
"""
import os
import uuid
from pathlib import Path
from typing import Optional

from fastapi import UploadFile, HTTPException
from PIL import Image

from app.config import settings

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp"}
MAX_SIZE = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024  # Convert to bytes


def get_upload_dir(subfolder: str) -> Path:
    """Get (and create) the upload directory for a given subfolder."""
    upload_path = Path(settings.UPLOAD_DIR) / subfolder
    upload_path.mkdir(parents=True, exist_ok=True)
    return upload_path


async def save_upload(
    file: UploadFile,
    subfolder: str,
    max_width: Optional[int] = 1200,
) -> str:
    """
    Save an uploaded file to disk. Returns the relative filename.
    
    Args:
        file: The uploaded file
        subfolder: e.g. "blog", "timeline", "news", "gallery"
        max_width: Optional max width for image resizing
    
    Returns:
        The saved filename (not full path)
    """
    # Validate extension
    ext = Path(file.filename).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"File type '{ext}' not allowed. Allowed: {', '.join(ALLOWED_EXTENSIONS)}",
        )

    # Read file content
    content = await file.read()

    # Validate size
    if len(content) > MAX_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"File too large. Maximum size: {settings.MAX_UPLOAD_SIZE_MB}MB",
        )

    # Generate unique filename
    unique_name = f"{uuid.uuid4().hex}{ext}"
    upload_dir = get_upload_dir(subfolder)
    file_path = upload_dir / unique_name

    # Save file
    with open(file_path, "wb") as f:
        f.write(content)

    # Optionally resize large images
    if max_width and ext in {".jpg", ".jpeg", ".png", ".webp"}:
        try:
            with Image.open(file_path) as img:
                if img.width > max_width:
                    ratio = max_width / img.width
                    new_height = int(img.height * ratio)
                    img = img.resize((max_width, new_height), Image.Resampling.LANCZOS)
                    img.save(file_path, optimize=True, quality=85)
        except Exception:
            pass  # If resize fails, keep original

    return f"{subfolder}/{unique_name}"


def delete_upload(filename: str, subfolder: str) -> bool:
    """Delete an uploaded file. Returns True if deleted."""
    base_filename = os.path.basename(filename)
    file_path = Path(settings.UPLOAD_DIR) / subfolder / base_filename
    if file_path.exists():
        os.remove(file_path)
        return True
    return False
