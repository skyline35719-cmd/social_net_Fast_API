from fastapi import APIRouter, Depends, HTTPException, status
from fastapi_users.exceptions import UserAlreadyExists
from fastapi_users.manager import BaseUserManager
from pydantic import BaseModel

from app.core.auth import auth_backend, current_active_user, fastapi_users
from app.models import User
from app.schemas import UserCreate, UserRead


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserLogin(BaseModel):
    username: str
    password: str


router = APIRouter()


# 1. КАСТОМНАЯ РЕГИСТРАЦИЯ (/auth/signup)
@router.post("/auth/signup", response_model=TokenResponse, tags=["auth"])
async def custom_register(
    user_in: UserCreate,
    user_manager: BaseUserManager = Depends(
        fastapi_users.get_user_manager
    ),
):
    try:
        user = await user_manager.create(user_in)
        strategy = auth_backend.get_strategy()
        token = await strategy.write_token(user)
        return {"access_token": token, "token_type": "bearer"}
    except UserAlreadyExists:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Пользователь с таким email уже существует",
        )


# 2. КАСТОМНЫЙ ЛОГИН (/auth/login) - принимает JSON!
@router.post("/auth/login", response_model=TokenResponse, tags=["auth"])
async def custom_login(
    credentials: UserLogin,
    user_manager: BaseUserManager = Depends(
        fastapi_users.get_user_manager
    ),
):
    user = await user_manager.authenticate(credentials)
    if user is None or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Неверный логин или пароль",
        )
    strategy = auth_backend.get_strategy()
    token = await strategy.write_token(user)
    return {"access_token": token, "token_type": "bearer"}


# 3. КАСТОМНЫЙ ТЕКУЩИЙ ПОЛЬЗОВАТЕЛЬ (/auth/me)
@router.get("/auth/me", response_model=UserRead, tags=["auth"])
async def custom_me(user: User = Depends(current_active_user)):
    return user


# 4. Сброс пароля
router.include_router(
    fastapi_users.get_reset_password_router(),
    prefix="/auth",
    tags=["auth"],
)
