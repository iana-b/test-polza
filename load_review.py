"""Load review.csv into the companies_review staging table and report on it."""
import argparse
import csv
import os

import psycopg
from dotenv import load_dotenv

load_dotenv()

COLUMNS = ["id", "name", "category", "city", "address", "rating", "reviews_count", "site", "phone"]

INSERT_SQL = f"""
    INSERT INTO companies_review (csv_row, {", ".join(COLUMNS)})
    VALUES (%s, {", ".join(["%s"] * len(COLUMNS))})
"""

REPORT_SQL = """
    SELECT
        count(*)                                                        AS rows_total,
        count(*) FILTER (WHERE coalesce(id, '') = '')                   AS no_id,
        count(*) FILTER (WHERE rating !~ '^\\d+(\\.\\d+)?$')             AS bad_rating,
        count(*) FILTER (WHERE reviews_count !~ '^\\d+$')                AS bad_reviews_count,
        count(DISTINCT id) FILTER (WHERE coalesce(id, '') <> '')        AS distinct_ids,
        count(*) FILTER (WHERE id IN (SELECT id FROM companies))        AS already_in_companies
    FROM companies_review
"""


def read_rows(csv_path: str) -> list[tuple]:
    with open(csv_path, encoding="utf-8", newline="") as f:
        reader = csv.DictReader(f)
        # enumerate со 2, чтобы номер совпадал со строкой файла (1 — заголовок)
        return [
            tuple([n] + [row[c] for c in COLUMNS])
            for n, row in enumerate(reader, start=2)
        ]


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("csv_path", help="Path to review.csv")
    parser.add_argument("--dsn", default=os.environ.get("DATABASE_URL"))
    args = parser.parse_args()

    if not args.dsn:
        parser.error("set DATABASE_URL in .env or pass --dsn")

    rows = read_rows(args.csv_path)

    with psycopg.connect(args.dsn) as conn:
        with conn.cursor() as cur:
            # Полная перезагрузка: у файла нет пригодного ключа (id бывает
            # пустым и дублируется), поэтому staging всегда переписываем целиком.
            cur.execute("TRUNCATE companies_review")
            cur.executemany(INSERT_SQL, rows)
            cur.execute(REPORT_SQL)
            report = cur.fetchone()
        conn.commit()

    total, no_id, bad_rating, bad_reviews, distinct_ids, already = report
    print(f"Загружено строк из {args.csv_path}: {total}")
    print(f"  без id:                        {no_id}")
    print(f"  уникальных id:                 {distinct_ids}")
    print(f"  rating не число:               {bad_rating}")
    print(f"  reviews_count не целое:        {bad_reviews}")
    print(f"  id уже есть в companies:       {already}")
    print()
    print("Разбор аномалий — docs/task3/ANOMALIES.md")


if __name__ == "__main__":
    main()
