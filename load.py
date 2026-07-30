"""Load company records from paginated JSON archive into Postgres."""
import argparse
import glob
import json
import os

import psycopg
from dotenv import load_dotenv

load_dotenv()

INSERT_SQL = """
    INSERT INTO companies (id, name, category, city, address, rating, reviews_count, site, phone)
    VALUES (%(id)s, %(name)s, %(category)s, %(city)s, %(address)s, %(rating)s, %(reviews_count)s, %(site)s, %(phone)s)
    ON CONFLICT (id) DO NOTHING
"""


def read_all_pages(data_dir: str) -> list[dict]:
    items = {}
    for path in sorted(glob.glob(os.path.join(data_dir, "page_*.json"))):
        with open(path, encoding="utf-8") as f:
            page = json.load(f)
        for item in page["items"]:
            items[item["id"]] = item
    return list(items.values())


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("data_dir", help="Directory containing page_*.json files")
    parser.add_argument("--dsn", default=os.environ.get(
        "DATABASE_URL", "postgresql://companies:companies@localhost:5432/companies"
    ))
    args = parser.parse_args()

    records = read_all_pages(args.data_dir)
    print(f"Read {len(records)} unique companies from {args.data_dir}")

    with psycopg.connect(args.dsn) as conn:
        with conn.cursor() as cur:
            cur.executemany(INSERT_SQL, records)
        conn.commit()

    print(f"Loaded {len(records)} companies into the database")


if __name__ == "__main__":
    main()
