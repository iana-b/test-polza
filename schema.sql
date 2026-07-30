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
