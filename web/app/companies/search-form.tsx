"use client";

import { usePathname, useRouter } from "next/navigation";
import { useRef, useTransition } from "react";

export function SearchForm({
  cities,
  q,
  city,
}: {
  cities: string[];
  q: string;
  city: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function navigate(nextQ: string, nextCity: string) {
    const params = new URLSearchParams();
    if (nextQ) params.set("q", nextQ);
    if (nextCity) params.set("city", nextCity);
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`);
    });
  }

  function onQueryChange(value: string) {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => navigate(value, city), 300);
  }

  return (
    <div style={{ display: "flex", gap: "1rem", margin: "1rem 0" }}>
      <input
        type="text"
        placeholder="Поиск по названию"
        defaultValue={q}
        onChange={(e) => onQueryChange(e.target.value)}
      />
      <select defaultValue={city} onChange={(e) => navigate(q, e.target.value)}>
        <option value="">Все города</option>
        {cities.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
      {isPending && <span>Обновление…</span>}
    </div>
  );
}
