Social Network
Полноценная социальная сеть с асинхронным бэкендом на FastAPI, React-фронтендом и PostgreSQL. Всё упаковано в Docker.

📋 О проекте
Full-stack приложение социальной сети с возможностью регистрации, создания постов, комментирования, подписок на других пользователей и объединения постов в сообщества.

Возможности
🔐 Аутентификация — JWT-токены, регистрация и вход по username

📝 Посты — создание, редактирование, удаление, поиск, пагинация

💬 Комментарии — обсуждение постов

👥 Профили — просмотр чужих профилей, подписки, счётчики

📁 Сообщества — создание групп, посты внутри групп, авто-генерация slug с транслитерацией

🎨 Современный UI — Tailwind CSS, фирменная цветовая схема (индиго), адаптивность

🛠️ Технологический стек
Бэкенд
Технология	Назначение
FastAPI	Веб-фреймворк
SQLAlchemy (async)	ORM
Alembic	Миграции БД
PostgreSQL 16	База данных
asyncpg	Async-драйвер для Postgres
fastapi-users	Аутентификация и JWT
fastapi-pagination	Пагинация
Pydantic v2	Валидация данных
Uvicorn	ASGI-сервер
Фронтенд
Технология	Назначение
React 18	UI-библиотека
TypeScript	Типизация
Vite	Сборщик
React Router	Роутинг
Zustand	State management
Axios	HTTP-запросы
Tailwind CSS	Стилизация
Inter	Шрифт
Инфраструктура
Технология	Назначение
Docker	Контейнеризация
Docker Compose	Оркестрация сервисов
Nginx	Раздача статики фронтенда
📁 Структура проекта
text
livej_fastapi-main/                 ← Корень проекта
│
├── docker-compose.yml              ← Оркестрация всех сервисов
├── Dockerfile                      ← Dockerfile бэкенда
├── requirements.txt                ← Python-зависимости
├── alembic.ini                     ← Конфиг Alembic
├── README.md
├── .env                            ← Переменные окружения (SECRET_KEY, DATABASE_URL, POSTGRES_*)
├── .env_example                    ← Пример для .env
├── .gitignore
├── .dockerignore
│
├── alembic/                        ← Миграции БД
│   ├── env.py
│   └── versions/
│
├── app/                            ← Код бэкенда (FastAPI)
│   ├── main.py                     ← Точка входа приложения
│   ├── config.py                   ← Настройки (Pydantic Settings)
│   ├── database.py                 ← Async SQLAlchemy engine
│   ├── models.py                   ← ORM-модели (User, Post, Group, Comment, Follow)
│   ├── schemas.py                  ← Pydantic-схемы
│   ├── dependencies.py             ← Dependency Injection (репозитории, сервисы)
│   ├── exceptions.py               ← Кастомные исключения
│   ├── core/
│   │   └── auth.py                 ← fastapi-users, JWT, UserManager
│   ├── routers/
│   │   ├── auth_users.py           ← Регистрация, логин, /auth/me
│   │   ├── posts_django.py         ← Посты, комментарии, профиль, подписки
│   │   ├── groups.py               ← Группы
│   │   └── comments.py             ← Комментарии
│   ├── repositories/               ← Работа с БД (запросы)
│   │   ├── posts.py
│   │   ├── user.py
│   │   └── group.py
│   └── services/                   ← Бизнес-логика
│       ├── post.py
│       ├── user.py
│       └── group.py
│
├── data/                           ← Данные приложения
│
├── .virt/                          ← Виртуальное окружение Python (не коммитится)
│
└── frontend/                       ← Фронтенд (React + Vite)
    ├── Dockerfile                  ← Multi-stage build (Node → Nginx)
    ├── nginx.conf                  ← Конфиг Nginx (SPA-роутинг)
    ├── .dockerignore
    ├── .env.production             ← VITE_API_URL
    ├── package.json
    ├── package-lock.json
    ├── vite.config.ts
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── tsconfig.json
    ├── index.html
    │
    └── src/
        ├── api/
        │   ├── clients.ts          ← Axios instance + interceptors
        │   └── endpoints.ts        ← Типизированные эндпоинты
        ├── components/
        │   ├── common/             ← Loader, Button и т.д.
        │   ├── group/              ← CreateGroupForm
        │   ├── layout/             ← Header, Layout
        │   ├── post/               ← PostCard, PostList
        │   └── profile/            ← FollowButton
        ├── pages/
        │   ├── HomePage.tsx
        │   ├── FeedPage.tsx
        │   ├── PostPage.tsx
        │   ├── CreatePostPage.tsx
        │   ├── EditPostPage.tsx
        │   ├── ProfilePage.tsx
        │   ├── GroupsPage.tsx
        │   ├── LoginPage.tsx
        │   └── RegisterPage.tsx
        ├── store/
        │   └── authStore.ts        ← Zustand-стор для auth
        ├── types/
        │   └── index.ts            ← Все TypeScript-типы
        ├── App.tsx                 ← Роутинг
        ├── main.tsx                ← Точка входа
        ├── index.css               ← Tailwind + базовые стили
        └── vite-env.d.ts           ← Типы для import.meta.env
⚠️ Внимание: Если в корне есть вложенная папка livej_fastapi-main/ (дубликат) — её можно удалить. Основной код находится в app/ и frontend/.

🚀 Быстрый старт
Предварительные требования
Docker Desktop (Windows/Mac)

Или Docker + Docker Compose (Linux)

Установка и запуск
1. Клонируйте репозиторий:

bash
git clone <your-repo-url>
cd livej_fastapi-main
2. Создайте .env в корне проекта:

env
# === Секреты приложения ===
SECRET_KEY=your-super-secret-key-change-in-production

# === Подключение к БД (хост = имя сервиса "db" в compose) ===
DATABASE_URL=postgresql+asyncpg://postgres:postgres@db:5432/livej_db

# === Настройки Postgres-контейнера ===
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=livej_db
💡 Генерация SECRET_KEY: используйте openssl rand -hex 32 или RandomKeygen

⚠️ Важно: Значения POSTGRES_* в URL подключения и в переменных должны совпадать.

3. Создайте frontend/.env.production:

env
VITE_API_URL=http://localhost:8000
4. Запустите весь стек одной командой:

bash
docker compose up --build -d
5. Дождитесь, пока все сервисы запустятся (~30 сек):

bash
docker compose ps
Все три контейнера должны быть Up (а postgres_db — Up (healthy)):

Сервис	Статус	Порт
postgres_db	Up (healthy)	5432
fastapi_backend	Up	8000
react_frontend	Up	3000
6. Откройте приложение:

Сервис	URL
🌐 Фронтенд	http://localhost:3000
🔌 API (Swagger)	http://localhost:8000/docs
🗄️ PostgreSQL	localhost:5432
🐳 Docker-команды
bash
# Запустить всё (с пересборкой)
docker compose up --build -d

# Остановить (данные сохраняются)
docker compose down

# Остановить и удалить БД (полный сброс)
docker compose down -v

# Логи конкретного сервиса
docker compose logs -f backend
docker compose logs -f db
docker compose logs -f frontend

# Статус всех сервисов
docker compose ps

# Пересобрать только бэкенд
docker compose up --build -d backend

# Зайти внутрь контейнера
docker exec -it fastapi_backend sh
docker exec -it postgres_db psql -U postgres -d livej_db
docker exec -it react_frontend sh
💻 Локальный запуск (без Docker)
Бэкенд
bash
# Активировать виртуальное окружение
.\.virt\Scripts\Activate.ps1       # Windows
source .virt/bin/activate           # Linux/Mac

# Установить зависимости (если ещё не установлены)
pip install -r requirements.txt

# Создать .env (можно SQLite для локальной разработки)
echo "SECRET_KEY=dev-secret-key" > .env
echo "DATABASE_URL=sqlite+aiosqlite:///./db.sqlite3" >> .env

# Применить миграции
alembic upgrade head

# Запустить сервер
uvicorn app.main:app --reload
Бэкенд будет на http://localhost:8000.

Фронтенд
bash
cd frontend
npm install
npm run dev
Фронтенд будет на http://localhost:3000.

⚠️ При локальном запуске обоих сервисов без Docker — фронт стучится на http://localhost:8000 (значение по умолчанию в clients.ts).

📚 API Endpoints
Аутентификация
Метод	URL	Описание
POST	/auth/signup	Регистрация
POST	/auth/login	Вход (по username)
GET	/auth/me	Текущий пользователь
Посты
Метод	URL	Описание
GET	/posts/?page=1&q=поиск	Лента (пагинация + поиск)
GET	/posts/{id}	Детали поста
POST	/posts/	Создать пост
PATCH	/posts/{id}/	Редактировать (только автор)
DELETE	/posts/{id}/	Удалить (только автор)
GET	/follow/?page=1	Лента подписок
Комментарии
Метод	URL	Описание
POST	/posts/{id}/comments/	Добавить комментарий
Профиль
Метод	URL	Описание
GET	/profile/me	Мой профиль
GET	/profile/{username}	Профиль пользователя
POST	/profile/{username}/follow/	Подписаться
DELETE	/profile/{username}/follow/	Отписаться
Группы
Метод	URL	Описание
GET	/groups/	Список групп
POST	/groups/	Создать группу
GET	/groups/{slug}/?page=1	Посты группы
🔑 Переменные окружения
.env (корень проекта — общий для Docker Compose и бэкенда)
Переменная	Описание	Пример
SECRET_KEY	Секретный ключ для JWT	abc123def456...
DATABASE_URL	URL подключения к БД	postgresql+asyncpg://postgres:postgres@db:5432/livej_db
POSTGRES_USER	Пользователь Postgres	postgres
POSTGRES_PASSWORD	Пароль Postgres	postgres
POSTGRES_DB	Имя базы данных	livej_db
frontend/.env.production
Переменная	Описание	Пример
VITE_API_URL	URL бэкенда для браузера	http://localhost:8000
💡 Почему в VITE_API_URL стоит localhost, а не db?
Потому что этот URL используется в браузере пользователя, а не внутри Docker-сети. Браузер обращается к localhost:8000, где Docker пробросил порт из контейнера.

⚠️ Решение проблем
Postgres: password authentication failed for user "postgres"
Причина: старый volume с другим паролем.

Решение:

bash
docker compose down -v
docker compose up --build -d
⚠️ Флаг -v удалит все данные Postgres. Для учебного проекта — это нормально.

Backend: Could not import module "main"
Причина: в Dockerfile неправильная команда запуска.

Решение: в Dockerfile должна быть строка:

dockerfile
CMD ["sh", "-c", "alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port 8000"]
Обратите внимание: app.main:app (а не main:app).

Backend: Name or service not known (хост db)
Причина: docker-compose.yml невалиден — сервис db не запущен или определён неверно.

Решение: убедитесь, что db — отдельный сервис на верхнем уровне services:, а не вложен в networks:.

Проверьте:

bash
docker compose ps
docker compose logs db
CORS-ошибки в браузере
Причина: фронт стучится на http://localhost:3000, а бэкенд не разрешает этот origin.

Решение: в app/main.py:

python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
MissingGreenlet в логах
Причина: SQLAlchemy пытается сделать ленивый запрос в async-контексте.

Решение: убедитесь, что все методы репозиториев используют joinedload для вложенных связей (author, group, comments). Пример:

python
stmt = (
    select(Post)
    .options(
        joinedload(Post.author),
        joinedload(Post.group),
    )
    .order_by(desc(Post.pub_date))
)
Фронтенд: Failed to load resource: localhost:8000
Причина: бэкенд не запущен или недоступен.

Решение:

bash
docker compose ps
docker compose logs backend
Контейнер fastapi_backend должен быть Up.

Порт занят (port is already allocated)
Причина: порт 3000, 8000 или 5432 уже используется.

Решение: проверьте, что не запущены локальные процессы:

bash
# Windows
netstat -ano | findstr :3000
netstat -ano | findstr :8000

# Linux/Mac
lsof -i :3000
lsof -i :8000
Или измените порт в docker-compose.yml:

yaml
ports:
  - "8080:80"      # вместо 3000:80
  - "8001:8000"    # вместо 8000:8000
ModuleNotFoundError: asyncpg
Причина: драйвер не установлен или не добавлен в requirements.txt.

Решение:

bash
pip install asyncpg
# Добавьте в requirements.txt строку:
# asyncpg
Затем пересоберите образ:

bash
docker compose up --build -d backend
🗄️ Миграции Alembic
bash
# Активировать окружение
.\.virt\Scripts\Activate.ps1    # Windows

# Создать новую миграцию
alembic revision --autogenerate -m "add new field"

# Применить миграции
alembic upgrade head

# Откатить последнюю
alembic downgrade -1

# Показать историю
alembic history

# Текущая версия
alembic current
⚠️ Для запуска миграций с хоста временно поменяйте DATABASE_URL в .env на localhost:5432:

text
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/livej_db
После применения миграций верните обратно @db:5432.

🎨 Дизайн-система
Цвета
Brand (индиго): #6366f1 — кнопки, ссылки, акценты

Фон страницы: #f9fafb (gray-50)

Карточки: белые с тенью shadow-soft

Ошибки: красный #ef4444 (red-500)

Успех: зелёный #10b981 (emerald-500)

Типографика
Шрифт: Inter (400, 500, 600, 700)

Скругления: rounded-2xl для карточек, rounded-xl для инпутов, rounded-full для аватаров

Анимации
animate-fadeIn — появление карточек

hover:shadow-card — «приподнимание» карточек при наведении

active:scale-[0.98] — нажатие на кнопки

Компоненты UI
Button (variants: primary, secondary, danger, ghost)

PostCard — карточка поста с аватаром, бейджем группы, действиями

Loader — спиннер для загрузки

FollowButton — кнопка подписки с состоянием

🔒 Безопасность (Production-чек-лист)
Перед деплоем в продакшн:

□ Заменить SECRET_KEY на криптостойкий (openssl rand -hex 32)
□ Использовать надёжный POSTGRES_PASSWORD (не postgres)
□ Отключить --reload в Uvicorn
□ Настроить HTTPS (Let's Encrypt / Cloudflare)
□ Ограничить allow_origins в CORS конкретным доменом
□ Установить DEBUG=False
□ Не коммитить .env в Git (добавить в .gitignore)
□ Настроить бэкапы Postgres (pg_dump через cron)
□ Добавить rate-limiting на auth-эндпоинты (slowapi)
□ Использовать docker secrets вместо .env для чувствительных данных
📝 Лицензия
Проект создан в учебных целях. Свободен для использования и модификации.

🙏 Благодарности
FastAPI — веб-фреймворк

SQLAlchemy — ORM с async-поддержкой

React — UI

Tailwind CSS — стилизация

Vite — сборка фронтенда

Docker — контейнеризация

