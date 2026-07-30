-- Топ-5 категорий по числу компаний
SELECT category, count(*) AS companies_count
FROM companies
GROUP BY category
ORDER BY companies_count DESC
LIMIT 5;

-- Средний рейтинг по городам среди компаний с 10+ отзывами
SELECT city, round(avg(rating), 2) AS avg_rating
FROM companies
WHERE reviews_count >= 10
GROUP BY city
ORDER BY avg_rating DESC;

-- Доля компаний с сайтом по категориям
SELECT
    category,
    round(count(site)::numeric / count(*), 2) AS share_with_site
FROM companies
GROUP BY category
ORDER BY share_with_site DESC;
