# Справочник компаний

Тестовое задание из трёх частей поверх одной базы PostgreSQL.

| Задача | Решение | Файлы |
|---|---|---|
| **1.** Собрать записи из архива, спроектировать схему, загрузить в PostgreSQL, приложить 3 SQL-запроса | 20 страниц (1000 записей) → 994 уникальные компании, дедупликация по `id`, индексы под запросы | [schema.sql](schema.sql), [load.py](load.py), [queries.sql](queries.sql) → [результаты](docs/task1/RESULTS.md) |
| **2.** Страница `/companies` на Next.js с поиском и фильтром, данные серверно, без секретов | Server Component ходит в Postgres при рендере — `DATABASE_URL` не попадает в браузер. Фильтры живут в URL | [web/](web) → [скриншоты и проверка](docs/task2/PROOF.md) |
| **3.** Загрузить `review.csv`, дать отчёт, перечислить странное | Файл оказался не выгрузкой этой базы, а другим набором — и грязным. Загружен в отдельную таблицу, чтобы не испортить архив | [load_review.py](load_review.py) → [разбор аномалий](docs/task3/ANOMALIES.md) |

## Запуск

Нужны Docker, Python 3.12+ и Node.js 20+.

Архив в репозиторий не коммитится — понадобится своя папка с `page_*.json` и `review.csv`, ниже это `<архив>`.

**1. База.** Скопировать `.env.example` в `.env`, заполнить своими значениями и поднять Postgres — схема применится сама:

```bash
cp .env.example .env
docker compose up -d
```

**2. Загрузка архива.** Читает все страницы, дедуплицирует по `id`, вставляет с `ON CONFLICT DO NOTHING` — повторный запуск безопасен:

```bash
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
.venv/bin/python load.py <архив>
```

**3. Запросы.** Топ-5 категорий; средний рейтинг по городам среди компаний с 10+ отзывами; доля компаний с сайтом по категориям:

```bash
docker exec -i companies_db sh -c 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB"' < queries.sql
```

**4. Загрузка `review.csv`.** Грузится в staging-таблицу `companies_review`, а не в `companies`: данные грязные, мешать их с архивом нельзя:

```bash
.venv/bin/python load_review.py <архив>/review.csv
```

**5. Веб-страница.** В `web/.env.local` — тот же `DATABASE_URL`, что и в корневом `.env`. Откроется на http://localhost:3000/companies:

```bash
cd web
cp .env.example .env.local
npm install
npm run dev
```
