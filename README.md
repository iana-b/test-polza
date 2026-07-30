# Archive data pipeline

Собирает записи о компаниях из постраничного JSON-архива (`page_*.json`) и загружает их в PostgreSQL.

## Запуск

0. Скопировать `.env.example` в `.env` и заменить плейсхолдеры реальными значениями:

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

   `/path/to/archive` — папка с файлами `page_001.json` ... `page_NNN.json`. Загрузчик читает все страницы, дедуплицирует записи по `id` и вставляет их с `ON CONFLICT (id) DO NOTHING`, поэтому повторный запуск безопасен и никогда не перезаписывает уже загруженные строки.

3. Выполнить аналитические запросы:

   ```bash
   docker exec -i companies_db psql -U companies -d companies < queries.sql
   ```

   Результаты на реальных данных — [docs/task1/RESULTS.md](docs/task1/RESULTS.md).

4. Загрузить `review.csv` (отдельная выгрузка со своими проблемами):

   ```bash
   .venv/bin/python load_review.py /path/to/archive/review.csv
   ```

   Грузится в staging-таблицу `companies_review`, а не в `companies`: данные грязные. Скрипт печатает сводку, разбор — [docs/task3/ANOMALIES.md](docs/task3/ANOMALIES.md).

5. Запустить веб-страницу `/companies`:

   ```bash
   cd web
   cp .env.example .env.local
   npm install
   npm run dev
   ```

   В `.env.local` нужно указать `DATABASE_URL` от той же базы. Страница открывается на http://localhost:3000/companies — таблица компаний с поиском по названию и фильтром по городу. Скриншоты и описание проверки — [docs/task2/PROOF.md](docs/task2/PROOF.md).

## Структура

- [schema.sql](schema.sql) — таблицы `companies` и `companies_review`, индексы
- [load.py](load.py) — загрузчик архива в базу
- [load_review.py](load_review.py) — загрузчик `review.csv` в staging-таблицу со сводкой по данным
- [queries.sql](queries.sql) — топ-5 категорий по числу компаний; средний рейтинг по городам среди компаний с 10+ отзывами; доля компаний с сайтом по категориям
- [docker-compose.yml](docker-compose.yml) — локальный Postgres
- [web/](web) — Next.js App Router: страница `/companies` (Server Component, запрос в Postgres на сервере)
- [docs/](docs) — результаты и доказательства по задачам
