import type { CSSProperties } from "react";
import { pool } from "@/lib/db";
import { SearchForm } from "./search-form";

type Company = {
  id: string;
  name: string;
  category: string;
  city: string;
  address: string;
  rating: string | null;
  reviews_count: number;
  site: string | null;
  phone: string | null;
};

export default async function CompaniesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; city?: string }>;
}) {
  const { q = "", city = "" } = await searchParams;

  const [{ rows: cities }, { rows: companies, rowCount }] = await Promise.all([
    pool.query<{ city: string }>("SELECT DISTINCT city FROM companies ORDER BY city"),
    pool.query<Company>(
      `SELECT id, name, category, city, address, rating, reviews_count, site, phone
       FROM companies
       WHERE name ILIKE $1
         AND ($2 = '' OR city = $2)
       ORDER BY name`,
      [`%${q}%`, city]
    ),
  ]);

  return (
    <main style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>Компании</h1>
      <SearchForm cities={cities.map((c) => c.city)} q={q} city={city} />
      <p>Найдено: {rowCount}</p>
      <div style={{ overflowX: "auto" }}>
        <table
          style={{
            borderCollapse: "collapse",
            width: "100%",
            border: "1px solid #ddd",
          }}
        >
          <thead>
            <tr>
              <th style={cellStyle}>Название</th>
              <th style={cellStyle}>Категория</th>
              <th style={cellStyle}>Город</th>
              <th style={cellStyle}>Адрес</th>
              <th style={cellStyle}>Рейтинг</th>
              <th style={cellStyle}>Отзывы</th>
              <th style={cellStyle}>Сайт</th>
              <th style={cellStyle}>Телефон</th>
            </tr>
          </thead>
          <tbody>
            {companies.map((c) => (
              <tr key={c.id}>
                <td style={cellStyle}>{c.name}</td>
                <td style={cellStyle}>{c.category}</td>
                <td style={cellStyle}>{c.city}</td>
                <td style={cellStyle}>{c.address}</td>
                <td style={cellStyle}>{c.rating ?? "—"}</td>
                <td style={cellStyle}>{c.reviews_count}</td>
                <td style={cellStyle}>
                  {c.site ? (
                    <a href={c.site} target="_blank" rel="noreferrer">
                      {c.site}
                    </a>
                  ) : (
                    "—"
                  )}
                </td>
                <td style={cellStyle}>{c.phone ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}

const cellStyle: CSSProperties = {
  border: "1px solid #ddd",
  padding: "0.5rem",
  textAlign: "left",
};
