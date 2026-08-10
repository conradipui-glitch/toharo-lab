# TOHARO LAB

Личный сайт-блог про вайб-кодинг и AI-агентов. Next.js 16 + Tailwind v4, статьи в MDX, **полностью статическая сборка**.

Публикацией занимается агент Ива: пишет `.mdx`, коммитит, пушит — VPS пересобирает сайт.

## Архитектура

Никакой админки, API, базы данных и авторизации. На проде лежат только HTML/CSS/JS. Единственный способ изменить сайт — коммит в репозиторий.

```
Ива → .mdx файл → git push → сборка → статика
```

Сайт публикуется в двух местах одной и той же командой сборки:

| Где | Адрес | Как обновляется |
| --- | --- | --- |
| **GitHub Pages** | https://conradipui-glitch.github.io/toharo-lab/ | Автоматически при пуше в `main` |
| **Свой домен** (когда купите) | https://toharo.space | `deploy/deploy.sh` на VPS |

Разница задаётся переменными окружения при сборке, код один и тот же:

```bash
# для Pages (подпуть)
BASE_PATH=/toharo-lab SITE_URL=https://conradipui-glitch.github.io/toharo-lab npm run build

# для своего домена (корень) — переменные не нужны
npm run build
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

### GitHub Pages (автоматически)

Пуш в `main` запускает [workflow](.github/workflows/deploy-pages.yml): проверка секретов → проверка постов → сборка → публикация. Ничего запускать руками не нужно.

Ход сборки виден во вкладке Actions. Если проверка упала, деплой не начнётся и на сайте останется предыдущая версия.

### VPS (когда появится домен)

Установка расписана в [deploy/README.md](deploy/README.md): клон, nginx, HTTPS через certbot, автообновление по таймеру.

```bash
/srv/toharo-lab/deploy/deploy.sh
```

Скрипт собирает статику и подменяет её атомарно. Упала сборка — на сайте остаётся предыдущая рабочая версия.

Статистика посещений — по логам nginx, без счётчиков и JS: [deploy/stats.md](deploy/stats.md).

## Домен

`toharo.space` — от $3–15/год на Namecheap или Porkbun. Зоны `.lab` не существует, купить её нельзя.

Бэкап контента — это git. Папка `content/posts/` и есть весь сайт.
