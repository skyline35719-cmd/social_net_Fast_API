from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi_pagination import Page
from fastapi_pagination.ext.sqlalchemy import paginate
from sqlalchemy import select, func, delete, desc
from sqlalchemy.orm import joinedload, selectinload
from sqlalchemy.ext.asyncio import AsyncSession #
from typing import Optional


from app.database import get_db
from app.models import Post, User, Group, Comment, Follow
from app.schemas import *
from app.dependencies import get_post_service, get_user_service, get_group_service
from app.services.post import PostService
from app.services.user import UserService
from app.services.group import GroupService
from app.core.auth import current_active_user

def handle_domain_exception(exc: Exception):
    if isinstance(exc, PostNotFoundError):
        raise HTTPException(status_code=404, detail=str(exc))
    if isinstance(exc, PermissionDeniedError):
        raise HTTPException(status_code=403, detail=str(exc))
    raise HTTPException(status_code=500, detail="Внутренняя ошибка сервера")

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

    # joinedload тянет автора сразу
    stmt = (
        select(Post)
        .options(joinedload(Post.author).load_only(User.id, User.username))
        .order_by(desc(Post.pub_date))
    )
    if q:
        stmt = stmt.where(Post.text.ilike(f"%{q}%"))
        
    return await paginate(db, stmt)


@router.get("/follow/", response_model=Page[PostList])
async def follow_index(
    service: PostService = Depends(get_post_service),
    current_user: User = Depends(current_active_user)
):

    try:
        return await service.get_follow_posts(current_user.id)
    except Exception as e:
        handle_domain_exception(e)

    stmt = (
        select(Post)
        .join(Follow, Post.author_id == Follow.author_id)
        .where(Follow.user_id == current_user.id)
        .options(joinedload(Post.author).load_only(User.id, User.username)) # не все поля
        .order_by(desc(Post.pub_date))
    )
    return await paginate(db, stmt)


@router.get("/groups/{slug}/")
async def group_posts(
    slug: str,
    service: PostService = Depends(get_post_service)
):

    try:
        return await service.get_group_posts(slug)
    except Exception as e:
        handle_domain_exception(e)

    group = await db.scalar(select(Group).where(Group.slug == slug))
    if not group:
        raise HTTPException(404, "Сообщество не найдено")

    stmt = (
        select(Post)
        .where(Post.group_id == group.id)
        .order_by(desc(Post.pub_date))
    )
    posts_page = await paginate(db, stmt)
    
    # Возвращаем группу + пагинированные посты
    return {"group": group, "posts": posts_page}


@router.post("/posts/", response_model=PostList, status_code=201)
async def create_post(
    form: PostCreate,
    service: PostService = Depends(get_post_service),
    # current_user: User = Depends(current_active_user)
    current_user: User = Depends(current_active_user) # добавлено
):
    
    try:
        return await service.create_post(current_user, form)
    except Exception as e:
        handle_domain_exception(e)

    new_post = Post(
        text=form.text,
        image=form.image,
        group_id=form.group_id,  # Если None → запишется NULL
        # author_id=current_user.get("id")
        author_id=current_user.id
    )
    db.add(new_post)
    await db.commit()
    await db.refresh(new_post)  # Подтягиваем id и pub_date из БД
    return new_post


@router.patch("/posts/{post_id}/", response_model=PostList)
async def edit_post(
    post_id: int,
    form: PostCreate,
    service: PostService = Depends(get_post_service),
    # current_user: User = Depends(current_active_user)
    current_user: User = Depends(current_active_user)
):

    try:
        return await service.edit_post(current_user, post_id, form)
    except Exception as e:
        handle_domain_exception(e)

    post = await db.scalar(select(Post).where(Post.id == post_id))
    if not post:
        raise HTTPException(404, "Пост не найден")
    if post.author_id != current_user.id:
        raise HTTPException(403, "Только автор может редактировать пост")

    # Обновляем только переданные поля
    for field, value in form.model_dump(exclude_unset=True).items():
        setattr(post, field, value)
        
    await db.commit()
    await db.refresh(post)
    return post


async def _get_profile_logic(db, target_username, current_user):
    author = await db.scalar(select(User).where(User.username == target_username))
    if not author:
        raise HTTPException(404, "Пользователь не найден")

    # Пагинация постов автора
    stmt = select(Post).where(Post.author_id == author.id).order_by(desc(Post.pub_date))
    posts_page = await paginate(db, stmt)

    total_posts = await db.scalar(
        select(func.count(Post.id)).where(Post.author_id == author.id)
    )

    # Проверка подписки
    is_following = False
    if current_user and current_user.id != author.id:
        exists = await db.scalar(
            select(Follow.id).where(
                Follow.user_id == current_user.id, 
                Follow.author_id == author.id
            ) # None, 6
        )
        is_following = exists is not None

    return {
        "author": author,
        "posts": posts_page,
        "is_following": is_following,
        "total_posts": total_posts
    }

@router.get("/profile/me", response_model=ProfileResponse)
async def my_profile(
    service: UserService = Depends(get_user_service),
    current_user: User = Depends(current_active_user)
):

    try:
        service._get_profile(current_user)
    except Exception as e:
        handle_domain_exception(e)

    return await _get_profile_logic(db, current_user.username, current_user)

@router.get("/profile/{username}", response_model=ProfileResponse)
async def user_profile(
    username: str,
    service: UserService = Depends(get_user_service),
    current_user: Optional[User] = Depends(current_active_user)
):

    try:
        service._get_profile(username, current_user)
    except Exception as e:
        handle_domain_exception(e)

    return await _get_profile_logic(db, current_user.username, current_user)
    return await _get_profile_logic(db, username, current_user)


@router.get("/posts/{post_id}", response_model=PostDetailResponse)
async def post_detail(post_id: int, service: PostService = Depends(get_post_service)):

    try:
        service._get_post_detail(post_id)
    except Exception as e:
        handle_domain_exception(e)

    # 1 запрос: Post + Author + Group + Comments (без N+1)
    stmt = (
        select(Post)
        .options(
            joinedload(Post.author).load_only(User.id, User.username),
            joinedload(Post.group),
            selectinload(Post.comments).options(joinedload(Comment.author).load_only(User.id, User.username))
        )
        .where(Post.id == post_id)
    )
    post = await db.scalar(stmt)
    if not post:
        raise HTTPException(404, "Пост не найден")

    # Отдельный быстрый запрос на count
    author_post_count = await db.scalar(
        select(func.count(Post.id)).where(Post.author_id == post.author_id)
    )

    return PostDetailResponse(post=post, author_post_count=author_post_count)


@router.get("/groups/", response_model=list[GroupRead])
async def list_groups(service: GroupService = Depends(get_group_service)):

    try:
        service._get_all_groups()
    except Exception as e:
        handle_domain_exception(e)


@router.post("/posts/{post_id}/comments/", response_model=CommentRead, status_code=201)
async def add_comment(
    post_id: int,
    form: CommentCreate,
    service: PostService = Depends(get_post_service),
    current_user: User = Depends(current_active_user)
):

    try:
        service.add_comment(current_user, form)
    except Exception as e:
        handle_domain_exception(e)

    post = await db.scalar(select(Post).where(Post.id == post_id))
    if not post:
        raise HTTPException(404, "Пост не найден")

    comment = Comment(text=form.text, post_id=post_id, author_id=current_user.id)
    db.add(comment)
    await db.commit()
    await db.refresh(comment)
    return comment


@router.post("/profile/{username}/follow/", status_code=201)
async def follow_user(
    username: str,
    service: UserService = Depends(get_user_service),
    current_user: User = Depends(current_active_user)
):

    try:
        service.follow_user(current_user, username)
    except Exception as e:
        handle_domain_exception(e)

@router.delete("/profile/{username}/follow/")
async def unfollow_user(
    username: str,
    service: UserService = Depends(get_user_service),
    current_user: User = Depends(current_active_user)
):

    try:
        service.follow_user(current_user, username)
    except Exception as e:
        handle_domain_exception(e)


@router.delete("/posts/{post_id}/", status_code=204)
async def delete_post(
    post_id: int,
    service: PostService = Depends(get_post_service),
    current_user: User = Depends(current_active_user)
):

    try:
        service.get_post_detail(current_user, post_id)
    except Exception as e:
        handle_domain_exception(e)

    # Достать пост из базы
    # проверка на None
    # проверка автора поста
    # .execute для delete
    post = await db.scalar(select(Post).where(Post.id == post_id))
    if not post:
        raise HTTPException(404, "Пост не найден")
    
    if current_user.id != post.author_id:
        raise HTTPException(403, "Вы можете удалить только свои посты")

    # await db.execute(
    #     delete(Post).where(Post.id == post_id)
    # )
    await db.execute(delete(post))
    await db.commit()
    return {"status": "success"}
