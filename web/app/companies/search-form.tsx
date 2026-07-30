"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useTransition } from "react";

const DEBOUNCE_MS = 300;

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
  const inputRef = useRef<HTMLInputElement>(null);
  const selectRef = useRef<HTMLSelectElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  // Читаем оба поля в момент навигации, а не из пропсов: иначе изменение
  // одного фильтра затирает другой, если пользователь успел поменять его
  // до срабатывания debounce.
  function navigate() {
    const params = new URLSearchParams();
    const nextQ = inputRef.current?.value ?? "";
    const nextCity = selectRef.current?.value ?? "";
    if (nextQ) params.set("q", nextQ);
    if (nextCity) params.set("city", nextCity);
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`);
    });
  }

  function navigateNow() {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    navigate();
  }

  function navigateDebounced() {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(navigate, DEBOUNCE_MS);
  }

  return (
    <div style={{ display: "flex", gap: "1rem", margin: "1rem 0" }}>
      <input
        ref={inputRef}
        type="text"
        placeholder="Поиск по названию"
        defaultValue={q}
        onChange={navigateDebounced}
      />
      <select ref={selectRef} defaultValue={city} onChange={navigateNow}>
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
