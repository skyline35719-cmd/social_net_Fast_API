from datetime import datetime
from typing import Optional

from fastapi_pagination import Page
from fastapi_users import schemas
from pydantic import BaseModel, ConfigDict, EmailStr


class UserRead(schemas.BaseUser[int]):
    username: str
    model_config = ConfigDict(from_attributes=True)

class UserCreate(schemas.BaseUserCreate):
    username: str
    email: EmailStr

class UserShort(BaseModel):
    id: int
    username: str
    model_config = ConfigDict(from_attributes=True)


# ==================== ГРУППЫ ====================
class GroupRead(BaseModel):
    id: int
    title: str
    slug: str
    description: str
    model_config = ConfigDict(from_attributes=True)

class GroupCreate(BaseModel):
    title: str
    description: str
    slug: Optional[str] = None


# ==================== КОММЕНТАРИИ ====================
class CommentCreate(BaseModel):
    text: str

class CommentRead(CommentCreate):
    id: int
    pub_date: datetime
    author: UserRead
    model_config = ConfigDict(from_attributes=True)


# ==================== ПОСТЫ ====================
class PostCreate(BaseModel):
    text: str
    group_id: Optional[int] = None
    image: Optional[str] = None

class PostList(BaseModel):
    id: int
    text: str
    pub_date: datetime
    image: Optional[str] = None
    author: UserRead
    author_id: int
    group_id: Optional[int]
    group: Optional[GroupRead] = None  # <--- ДОБАВЛЕНО: бейдж группы в карточке
    model_config = ConfigDict(from_attributes=True)

class PostDetail(BaseModel):
    id: int
    text: str
    pub_date: datetime
    image: Optional[str] = None
    author: UserRead
    group: Optional[GroupRead] = None
    comments: list[CommentRead] = []
    model_config = ConfigDict(from_attributes=True)

class PostDetailResponse(BaseModel):
    post: PostDetail
    author_post_count: int


# ==================== ГРУППА С ПОСТАМИ ====================
class GroupDetailResponse(BaseModel):
    group: GroupRead
    posts: Page[PostList]


# ==================== ПРОФИЛЬ ====================
class ProfileResponse(BaseModel):
    author: UserRead
    posts: Page[PostList]
    is_following: bool
    total_posts: int
    model_config = ConfigDict(from_attributes=True)