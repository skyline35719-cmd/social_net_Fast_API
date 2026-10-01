import os
from typing import Optional

from fastapi import Depends, Request
from fastapi_users import BaseUserManager, FastAPIUsers, IntegerIDMixin
from fastapi_users.authentication import (AuthenticationBackend,
                                          BearerTransport, JWTStrategy)
from fastapi_users.db import SQLAlchemyUserDatabase
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.database import engine, get_db
from app.models import User

SECRET_KEY = settings.SECRET_KEY


# ==================== 1. ТРАНСПОРТ ====================
bearer_transport = BearerTransport(tokenUrl="/auth/jwt/login")

# ==================== 2. СТРАТЕГИЯ ====================
def get_jwt_strategy() -> JWTStrategy:
    return JWTStrategy(secret=SECRET_KEY, lifetime_seconds=3600)

# ==================== 3. БЭКЕНД АУТЕНТИФИКАЦИИ ====================
auth_backend = AuthenticationBackend(
    name="jwt",
    transport=bearer_transport,
    get_strategy=get_jwt_strategy,
)

# ==================== 4. МЕНЕДЖЕР ПОЛЬЗОВАТЕЛЕЙ ====================
class UserManager(IntegerIDMixin, BaseUserManager[User, int]):
    reset_password_token_secret = SECRET_KEY
    verification_token_secret = SECRET_KEY

    async def on_after_register(self, user: User, request: Optional[Request] = None):
        print(f"Новый пользователь: {user.email} (ID: {user.id})")

    async def on_after_forgot_password(self, user: User, token: str, request: Optional[Request] = None):
        print(f"🔑 Токен сброса для {user.email}: {token}")

    # ==================== КАСТОМНАЯ АУТЕНТИФИКАЦИЯ ПО USERNAME ====================
    async def authenticate(self, credentials) -> User | None:
        """
        Переопределяем стандартный метод.
        Ищем пользователя по username (а не по email).
        """
        # credentials — это наш кастомный UserLogin с полями username и password
        stmt = select(User).where(User.username == credentials.username)
        user = await self.user_db.session.scalar(stmt)
        
        if user is None:
            # Возвращаем None, чтобы FastAPI вернул 400
            return None

        # Проверяем пароль через хелпер из fastapi-users
        verified, updated_password_hash = self.password_helper.verify_and_update(
            credentials.password, user.hashed_password
        )
        
        if not verified:
            return None

        # Если хеш пароля устарел — обновляем его в БД
        if updated_password_hash is not None:
            await self.user_db.update(user, {"hashed_password": updated_password_hash})

        return user


# ==================== 5. ЗАВИСИМОСТИ (DI) ====================
async def get_user_db(session: AsyncSession = Depends(get_db)):
    yield SQLAlchemyUserDatabase(session, User)

async def get_user_manager(user_db: SQLAlchemyUserDatabase = Depends(get_user_db)):
    yield UserManager(user_db)

fastapi_users = FastAPIUsers[User, int](get_user_manager, [auth_backend])

current_active_user = fastapi_users.current_user(active=True)