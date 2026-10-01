from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi_pagination import add_pagination

from app.routers import comments, groups, posts_django
from app.routers.auth_users import router as auth_users_router


async def lifespan(app: FastAPI):
    # Код, выполняющийся до старта приложения
    print("🚀 Приложение запускается...")
    yield
    # Код, выполняющийся после завершения
    print("🛑 Приложение останавливается...")


app = FastAPI(title="livej_fastAPI", lifespan=lifespan)


# ==================== CORS ====================
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://0.0.0.0:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==================== РОУТЕРЫ ====================
app.include_router(auth_users_router)
app.include_router(posts_django.router)
app.include_router(groups.router)
app.include_router(comments.router)

add_pagination(app)


# ==================== ЗАПУСК ====================
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",   # Слушать все сетевые интерфейсы (для Docker)
        port=8000,
        reload=False,     # В production выключено; включайте только локально
    )
