# Как  запустить проект
* Запуск виртуального окружения   
          python -m venv .venv
* Активация виртуального окружения   
          .venv\Scripts\activate
* pip install -r requiments.txt
* сгенироровать secret_key в .env  
          python -c "import secrets; print(secrets.token_hex(32))"
* применить миграции  
         alembic upgrade head 
* запустить проект    
        python -m app.main 
* докер  
  первый запуск
        docker compose up --build    
  создать и запустить все контейнеры 
        docker compose up   
  остановить и удалить все контейнеры и сети, созданные Compose    
        docker compose down
  создать и запустить контейнер    
        docker run <имя_образа>

