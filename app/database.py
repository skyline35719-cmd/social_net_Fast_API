from pathlib import Path

from sqlalchemy.ext.asyncio import (AsyncSession, async_sessionmaker,
                                    create_async_engine)
from sqlalchemy.orm import DeclarativeBase

from app.config import settings

BASE_DIR = Path(__file__).resolve().parent.parent

# 2. Создаем абсолютный путь к файлу базы данных в корне проекта
# Мы используем db.sqlite3, так как именно этот файл лежит у вас в проводнике
# SQLALCHEMY_DATABASE_URL = f"sqlite+aiosqlite:///{BASE_DIR}/db.sqlite3"
SQLALCHEMY_DATABASE_URL = settings.DATABASE_URL

engine = create_async_engine(SQLALCHEMY_DATABASE_URL)
async_session_maker = async_sessionmaker(engine, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


async def get_db():
    async with async_session_maker() as session:
        yield session
