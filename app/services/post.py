from fastapi_pagination import Params

from app.exceptions import (GroupNotFoundError, PermissionDeniedError,
                            PostNotFoundError)
from app.models import User
from app.repositories.group import GroupRepository
from app.repositories.posts import PostRepository
from app.schemas import (CommentCreate, CommentRead, PostCreate,
                         PostDetailResponse, PostList)


class PostService:
    def __init__(self, post_repo: PostRepository, group_repo: GroupRepository):
        self.post_repo = post_repo
        self.group_repo = group_repo

    async def get_posts(self, q: str | None):
        page = await self.post_repo.get_feed(q)
        return page

    async def get_follow_posts(self, user_id: int):
        return await self.post_repo.get_follow_feed(user_id)

    async def get_group_posts(self, slug: str, params: Params):
        group = await self.group_repo.get_by_slug(slug)
        if not group:
            raise GroupNotFoundError("Сообщество не найдено")

        posts_page = await self.post_repo.get_group_posts(group.id, params)
        return {"group": group, "posts": posts_page}

    async def create_post(self, current_user: User, form: PostCreate) -> PostList:
        new_post = await self.post_repo.create(
            author_id=current_user.id,
            text=form.text,
            image=form.image,
            group_id=form.group_id
        )
        # author и group уже подгружены через joinedload в репозитории
        return PostList.model_validate(new_post)

    async def edit_post(self, current_user: User, post_id: int, form: PostCreate) -> PostList:
        post = await self.post_repo.get_by_id(post_id)
        if not post:
            raise PostNotFoundError("Пост не найден")
        if post.author_id != current_user.id:
            raise PermissionDeniedError("Только автор может редактировать пост")

        update_data = form.model_dump(exclude_unset=True)
        updated_post = await self.post_repo.update(post, update_data)
        # author и group уже подгружены через joinedload в репозитории
        return PostList.model_validate(updated_post)

    async def _get_post_detail(self, post_id: int) -> PostDetailResponse:
        post = await self.post_repo.get_detail_by_id(post_id)
        if not post:
            raise PostNotFoundError("Пост не найден")

        author_post_count = await self.post_repo.get_author_post_count(post.author_id)
        return PostDetailResponse(post=post, author_post_count=author_post_count)

    async def delete_post(self, current_user: User, post_id: int) -> dict:
        post = await self.post_repo.get_by_id(post_id)
        if not post:
            raise PostNotFoundError("Пост не найден")
        if post.author_id != current_user.id:
            raise PermissionDeniedError("Вы можете удалить только свои посты")

        await self.post_repo.delete(post)
        return {"status": "success"}

    async def add_comment(self, current_user: User, post_id: int, form: CommentCreate) -> CommentRead:
        post = await self.post_repo.get_by_id(post_id)
        if not post:
            raise PostNotFoundError("Пост не найден")

        comment = await self.post_repo.add_comment(
            post_id=post_id,
            author_id=current_user.id,
            text=form.text
        )
        # author не подгружен в репозитории add_comment, поэтому оставляем
        comment.author = current_user
        return CommentRead.model_validate(comment)