"""Common schemas: pagination, generic responses."""
from pydantic import BaseModel
from typing import Generic, TypeVar, List, Optional

T = TypeVar("T")


class PaginationParams(BaseModel):
    page: int = 1
    limit: int = 10


class PaginatedResponse(BaseModel, Generic[T]):
    items: List[T]
    total: int
    page: int
    limit: int
    total_pages: int


class MessageResponse(BaseModel):
    message: str
    success: bool = True
