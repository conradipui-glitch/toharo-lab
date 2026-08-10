# TOHARO LAB

Личный сайт-блог про вайб-кодинг и AI-агентов. Next.js 16 + Tailwind v4, статьи в MDX, **полностью статическая сборка**.

Публикацией занимается агент Ива: пишет `.mdx`, коммитит, пушит — VPS пересобирает сайт.

## Архитектура

Никакой админки, API, базы данных и авторизации. На проде лежат только HTML/CSS/JS, которые отдаёт nginx. Единственный способ изменить сайт — коммит в приватный репозиторий.

```
Ива → .mdx файл → git push → VPS: сборка → /var/www → nginx
```

## Локальный запуск

```bash
npm install && npm run dev
```

http://localhost:3000

## Команды

| Команда | Что делает |
| --- | --- |
| `npm run dev` | Дев-сервер |
| `npm run build` | Статическая сборка в `out/` (сначала проверит посты) |
| `npm run check` | Проверить frontmatter всех постов |
| `npm run new-post` | Создать заготовку поста |
| `npm run lint` | ESLint |

## Публикация поста

```bash
npm run new-post -- --title "Заголовок" --category Гайд --excerpt "Описание"
```

Написать текст, поставить `published: true`, затем:

```bash
npm run check && git add content/posts/ && git commit -m "post: заголовок" && git push
```

Подробности и правила формата — в [AGENTS.md](AGENTS.md).

Черновики (`published: false`) не попадают в сборку вообще — ни страницы, ни упоминания в HTML. Незаконченное можно спокойно коммитить.

## Структура

| Путь | Что это |
| --- | --- |
| `content/posts/*.mdx` | Все посты — это и есть база данных |
| `src/lib/post-schema.ts` | Рубрики, типы, slugify (можно импортировать в клиент) |
| `src/lib/posts.ts` | Чтение с диска, только на этапе сборки |
| `src/app/` | Страницы: главная, `/blog`, `/blog/[slug]`, `/category/[category]`, `/about` |
| `scripts/` | `new-post.mjs`, `check-posts.mjs` |
| `deploy/` | `deploy.sh`, `nginx.conf` и инструкция по VPS |

## Деплой

Установка на VPS расписана в [deploy/README.md](deploy/README.md): клон репозитория, nginx, HTTPS через certbot и автообновление по таймеру.

Обновление сайта:

```bash
/srv/toharo-lab/deploy/deploy.sh
```

Скрипт собирает статику и подменяет её атомарно. Если сборка упала — на сайте остаётся предыдущая рабочая версия.

## Домен

`toharo.space` — от $3–15/год на Namecheap или Porkbun. Зоны `.lab` не существует, купить её нельзя.

Бэкап контента — это git. Папка `content/posts/` и есть весь сайт.
