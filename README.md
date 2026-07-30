# Archive data pipeline

Собирает записи о компаниях из постраничного JSON-архива (`page_*.json`) и загружает их в PostgreSQL.

## Запуск

0. Скопировать `.env.example` в `.env` (при необходимости поменять значения):

   ```bash
   cp .env.example .env
   ```

1. Поднять базу:

   ```bash
   docker compose up -d
   ```

   Postgres стартует на порту из `.env` (`POSTGRES_PORT`, по умолчанию `5433`), схема (`schema.sql`) применяется автоматически при первом запуске.

2. Установить зависимости и загрузить данные:

   ```bash
   python3 -m venv .venv
   .venv/bin/pip install -r requirements.txt
   .venv/bin/python load.py /path/to/archive
   ```

   `/path/to/archive` — папка с файлами `page_001.json` ... `page_NNN.json`. Загрузчик читает все страницы, дедуплицирует записи по `id` и делает upsert, поэтому повторный запуск безопасен.

3. Выполнить аналитические запросы:

   ```bash
   docker exec -i companies_db psql -U companies -d companies < queries.sql
   ```

## Структура

- [schema.sql](schema.sql) — таблица `companies` и индексы
- [load.py](load.py) — загрузчик архива в базу
- [queries.sql](queries.sql) — топ-5 категорий по числу компаний; средний рейтинг по городам среди компаний с 10+ отзывами; доля компаний с сайтом по категориям
- [docker-compose.yml](docker-compose.yml) — локальный Postgres
