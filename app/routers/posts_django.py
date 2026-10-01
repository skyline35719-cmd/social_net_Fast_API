from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi_pagination import Page, Params
from sqlalchemy.orm import Session

from app.core.auth import current_active_user
from app.dependencies import (get_group_service, get_post_service,
                              get_user_service)
from app.exceptions import PermissionDeniedError, PostNotFoundError
from app.models import Post, User
from app.schemas import (CommentCreate, CommentRead,  # <--- ДОБАВЛЕНО
                         GroupCreate, GroupDetailResponse, GroupRead,
                         PostCreate, PostDetailResponse, PostList,
                         ProfileResponse)
from app.services.group import GroupService
from app.services.post import PostService
from app.services.user import UserService


def handle_domain_exception(exc: Exception):
    if isinstance(exc, PostNotFoundError):
        raise HTTPException(status_code=404, detail=str(exc))
    if isinstance(exc, PermissionDeniedError):
        raise HTTPException(status_code=403, detail=str(exc))
    raise exc


router = APIRouter(tags=["posts"])


@router.get("/posts/", response_model=Page[PostList])
async def index(
    q: Optional[str] = Query(None, description="Поиск по тексту"),
    service: PostService = Depends(get_post_service)
):
    try:
        return await service.get_posts(q)
    except Exception as e:
        handle_domain_exception(e)


@router.get("/follow/", response_model=Page[PostList])
async def follow_index(
    service: PostService = Depends(get_post_service),
    current_user: User = Depends(current_active_user)
):
    try:
        return await service.get_follow_posts(current_user.id)
    except Exception as e:
        handle_domain_exception(e)


# ==================== ГРУППЫ ====================
# ВАЖНО: сначала непараметризованные маршруты, потом с {slug}

@router.get("/groups/", response_model=list[GroupRead])
async def list_groups(
    service: GroupService = Depends(get_group_service)
):
    try:
        return await service.get_all_groups()
    except Exception as e:
        handle_domain_exception(e)


@router.post("/groups/", response_model=GroupRead, status_code=201)
async def create_group(
    form: GroupCreate,
    service: GroupService = Depends(get_group_service),
    current_user: User = Depends(current_active_user),
):
    try:
        return await service.create_group(form)
    except Exception as e:
        handle_domain_exception(e)


# Этот эндпоинт ДОЛЖЕН идти после /groups/
@router.get("/groups/{slug}/", response_model=GroupDetailResponse)  # <--- ДОБАВЛЕНО response_model
async def group_posts(
    slug: str,
    params: Params = Depends(),
    service: PostService = Depends(get_post_service)
):
    try:
        return await service.get_group_posts(slug, params)
    except Exception as e:
        handle_domain_exception(e)


# ==================== ПОСТЫ ====================
@router.post("/posts/", response_model=PostList, status_code=201)
async def create_post(
    form: PostCreate,
    service: PostService = Depends(get_post_service),
    current_user: User = Depends(current_active_user)
):
    try:
        return await service.create_post(current_user, form)
    except Exception as e:
        handle_domain_exception(e)


@router.patch("/posts/{post_id}/", response_model=PostList)
async def edit_post(
    post_id: int,
    form: PostCreate,
    service: PostService = Depends(get_post_service),
    current_user: User = Depends(current_active_user)
):
    try:
        return await service.edit_post(current_user, post_id, form)
    except Exception as e:
        handle_domain_exception(e)


# ==================== ПРОФИЛЬ ====================
@router.get("/profile/me", response_model=ProfileResponse)
async def my_profile(
    params: Params = Depends(),
    service: UserService = Depends(get_user_service),
    current_user: User = Depends(current_active_user)
):
    try:
        return await service.get_profile(None, current_user, params)
    except Exception as e:
        handle_domain_exception(e)


@router.get("/profile/{username}", response_model=ProfileResponse)
async def user_profile(
    username: str,
    params: Params = Depends(),
    service: UserService = Depends(get_user_service),
    current_user: Optional[User] = Depends(current_active_user)
):
    try:
        return await service.get_profile(username, current_user, params)
    except Exception as e:
        handle_domain_exception(e)


# ==================== ДЕТАЛИ ПОСТА ====================
@router.get("/posts/{post_id}", response_model=PostDetailResponse)
async def post_detail(
    post_id: int, 
    service: PostService = Depends(get_post_service)
):
    try:
        return await service._get_post_detail(post_id)
    except Exception as e:
        handle_domain_exception(e)


# ==================== КОММЕНТАРИИ ====================
@router.post("/posts/{post_id}/comments/", response_model=CommentRead, status_code=201)
async def add_comment(
    post_id: int,
    form: CommentCreate,
    service: PostService = Depends(get_post_service),
    current_user: User = Depends(current_active_user)
):
    try:
        return await service.add_comment(current_user, post_id, form)
    except Exception as e:
        handle_domain_exception(e)


# ==================== ПОДПИСКИ ====================
@router.post("/profile/{username}/follow/", status_code=201)
async def follow_user(
    username: str,
    service: UserService = Depends(get_user_service),
    current_user: User = Depends(current_active_user)
):
    try:
        return await service.follow_user(current_user, username)
    except Exception as e:
        handle_domain_exception(e)


@router.delete("/profile/{username}/follow/", status_code=200)
async def unfollow_user(
    username: str,
    service: UserService = Depends(get_user_service),
    current_user: User = Depends(current_active_user)
):
    try:
        return await service.unfollow_user(current_user, username)
    except Exception as e:
        handle_domain_exception(e)


# ==================== УДАЛЕНИЕ ПОСТА ====================
@router.delete("/posts/{post_id}/", status_code=200)
async def delete_post(
    post_id: int,
    service: PostService = Depends(get_post_service),
    current_user: User = Depends(current_active_user)
):
    try:
        return await service.delete_post(current_user, post_id)
    except Exception as e:
        handle_domain_exception(e)