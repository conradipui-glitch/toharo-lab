#!/usr/bin/env node
/**
 * Собирает страницы-редиректы /go/<id>/ из content/links.json.
 * Запускается перед сборкой; результат кладётся в public/go/ и копируется в out/.
 *
 * Зачем прослойка вместо прямой ссылки в тексте:
 *  1. URL партнёрки живёт в одном месте — поменять можно, не трогая статьи;
 *  2. каждый клик виден в логах nginx как заход на /go/<id>/, то есть статистика
 *     переходов получается без единой строки JS и без сторонних счётчиков;
 *  3. если партнёрка отвалилась, ссылку перенаправляем централизованно.
 */
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const LINKS_FILE = path.join(process.cwd(), "content", "links.json");
const OUT_DIR = path.join(process.cwd(), "public", "go");

function fail(msg) {
  console.error(`Ошибка: ${msg}`);
  process.exit(1);
}

/** Экранирование для вставки в HTML-атрибут. */
function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Каталог всегда пересоздаём: удалённая из реестра ссылка не должна остаться висеть
fs.rmSync(OUT_DIR, { recursive: true, force: true });

if (!fs.existsSync(LINKS_FILE)) {
  console.log("content/links.json не найден — редиректов нет.");
  process.exit(0);
}

let links;
try {
  links = JSON.parse(fs.readFileSync(LINKS_FILE, "utf-8")).links ?? {};
} catch (err) {
  fail(`content/links.json не разбирается: ${err.message}`);
}

const ids = Object.keys(links);
if (ids.length === 0) {
  console.log("В реестре нет ссылок — редиректов не создано.");
  process.exit(0);
}

for (const id of ids) {
  const link = links[id];

  if (!/^[a-z0-9-]+$/.test(id))
    fail(`id "${id}" должен быть из латиницы, цифр и дефисов — он попадает в URL /go/${id}/`);
  if (typeof link.url !== "string" || !link.url.startsWith("https://"))
    fail(`ссылка "${id}": url должен начинаться с https:// (сейчас ${JSON.stringify(link.url)})`);
  if (!link.label) fail(`ссылка "${id}": нужен label`);

  const dir = path.join(OUT_DIR, id);
  fs.mkdirSync(dir, { recursive: true });

  const html = `<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="robots" content="noindex, nofollow">
<meta http-equiv="refresh" content="0; url=${esc(link.url)}">
<link rel="canonical" href="${esc(link.url)}">
<title>Переход на ${esc(link.label)}</title>
<style>
  body{font:15px/1.5 system-ui,sans-serif;background:#f7f4ec;color:#14140f;
       display:flex;min-height:100vh;align-items:center;justify-content:center;margin:0;text-align:center}
  a{color:#14140f}
</style>
</head>
<body>
<div>
  <p>Переходим на ${esc(link.label)}…</p>
  <p><a href="${esc(link.url)}" rel="${link.sponsored ? "sponsored " : ""}noopener nofollow">Открыть вручную</a></p>
</div>
</body>
</html>
`;

  fs.writeFileSync(path.join(dir, "index.html"), html, "utf-8");
}

const sponsored = ids.filter((id) => links[id].sponsored).length;
console.log(
  `Редиректов собрано: ${ids.length} (партнёрских ${sponsored}) → public/go/`
);
