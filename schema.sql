-- Схема хранения компаний, собранных из постраничного архива.
CREATE TABLE IF NOT EXISTS companies (
    id            TEXT PRIMARY KEY,       -- естественный ключ из архива (например c_000001) -- дедупликация через ON CONFLICT в загрузчике
    name          TEXT NOT NULL,
    category      TEXT NOT NULL,
    city          TEXT NOT NULL,
    address       TEXT NOT NULL,
    rating        NUMERIC(2, 1),          -- NULL, если у компании ещё нет рейтинга
    reviews_count INTEGER NOT NULL DEFAULT 0,
    site          TEXT,
    phone         TEXT
);

-- топ-5 категорий по числу компаний / доля компаний с сайтом по категориям
CREATE INDEX IF NOT EXISTS idx_companies_category ON companies (category);

-- средний рейтинг по городам
CREATE INDEX IF NOT EXISTS idx_companies_city ON companies (city);

-- фильтр "10+ отзывов"
CREATE INDEX IF NOT EXISTS idx_companies_reviews_count ON companies (reviews_count);

-- Сырая выгрузка review.csv. Отдельная таблица, а не companies: данные там
-- заведомо грязные (см. docs/task3/ANOMALIES.md), и смешивать их с проверенным
-- архивом нельзя. Все колонки TEXT и без ограничений, чтобы битые значения
-- ("N/A", "много", -3) грузились как есть и были видны в отчёте, а не роняли
-- загрузку. csv_row — номер строки в файле, чтобы находить проблему в исходнике.
CREATE TABLE IF NOT EXISTS companies_review (
    csv_row       INTEGER PRIMARY KEY,
    id            TEXT,
    name          TEXT,
    category      TEXT,
    city          TEXT,
    address       TEXT,
    rating        TEXT,
    reviews_count TEXT,
    site          TEXT,
    phone         TEXT
);
