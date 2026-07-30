"""Tests for the archive reader: deduplication and which files it picks up."""
import json

from load import read_all_pages


def write_page(directory, number: int, items: list[dict]) -> None:
    page = {"page": number, "per_page": len(items), "total": len(items), "items": items}
    path = directory / f"page_{number:03d}.json"
    path.write_text(json.dumps(page, ensure_ascii=False), encoding="utf-8")


def company(company_id: str, **overrides) -> dict:
    return {
        "id": company_id,
        "name": "ООО «Тест»",
        "category": "IT-интегратор",
        "city": "Москва",
        "address": "ул. Ленина, д. 1",
        "rating": 4.2,
        "reviews_count": 10,
        "site": None,
        "phone": None,
        **overrides,
    }


def test_deduplicates_id_repeated_across_pages(tmp_path):
    # В реальном архиве 6 записей попали на две страницы каждая.
    write_page(tmp_path, 1, [company("c_000001"), company("c_000002")])
    write_page(tmp_path, 2, [company("c_000001")])

    records = read_all_pages(str(tmp_path))

    assert sorted(r["id"] for r in records) == ["c_000001", "c_000002"]


def test_ignores_files_that_are_not_pages(tmp_path):
    # В папке архива рядом со страницами лежит review.csv — отдельная грязная
    # выгрузка, которой нечего делать в companies (см. docs/task3/ANOMALIES.md).
    # Посторонние .json тоже не должны подхватываться, поэтому в подложенном
    # файле лежит настоящая запись: если маску ослабить, тест это увидит.
    write_page(tmp_path, 1, [company("c_000001")])
    (tmp_path / "review.csv").write_text("id,name\nc_999999,мусор\n", encoding="utf-8")
    (tmp_path / "pages_backup.json").write_text(
        json.dumps({"items": [company("c_999999")]}), encoding="utf-8"
    )

    records = read_all_pages(str(tmp_path))

    assert [r["id"] for r in records] == ["c_000001"]
