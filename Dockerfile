FROM python:3.12-slim

# Не создавать .pyc и не буферизовать stdout (для логов)
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# Ставим зависимости отдельно — так кэш слоёв будет работать лучше
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# for SQLite3
# RUN mkdir -p /app/data

EXPOSE 8000

CMD ["sh", "-c", "alembic upgrade head && uvicorn app.main:app --host 0.0.0.0"]