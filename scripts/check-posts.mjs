#!/usr/bin/env node
/**
 * Проверяет посты перед сборкой. Запускается автоматически (prebuild) и в pre-commit.
 * Если хоть один файл кривой — сборка падает, и на сайт ничего не уезжает.
 */
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import matter from "gray-matter";

const CATEGORIES = ["Статья", "Гайд", "Заметка"];
const POSTS_DIR = path.join(process.cwd(), "content", "posts");
const LINKS_FILE = path.join(process.cwd(), "content", "links.json");
const COVERS_DIR = path.join(process.cwd(), "public", "covers");

/** Минимальная длина тела поста. Сайт — не телеграм, короткие заметки сюда не идут. */
const MIN_BODY_CHARS = { Заметка: 1200, Статья: 3000, Гайд: 3000 };

if (!fs.existsSync(POSTS_DIR)) {
  console.log("Папки content/posts нет — пропускаю проверку.");
  process.exit(0);
}

let linkIds = new Set();
let sponsoredIds = new Set();
if (fs.existsSync(LINKS_FILE)) {
  try {
    const links = JSON.parse(fs.readFileSync(LINKS_FILE, "utf-8")).links ?? {};
    linkIds = new Set(Object.keys(links));
    sponsoredIds = new Set(
      Object.keys(links).filter((id) => links[id].sponsored)
    );
  } catch (err) {
    console.error(`Ошибка: content/links.json не разбирается — ${err.message}`);
    process.exit(1);
  }
}

const files = fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith(".mdx"));
const problems = [];
const warnings = [];

for (const file of files) {
  const where = `content/posts/${file}`;
  const slug = file.replace(/\.mdx$/, "");
  let data, content;

  try {
    ({ data, content } = matter(
      fs.readFileSync(path.join(POSTS_DIR, file), "utf-8")
    ));
  } catch (err) {
    problems.push(`${where}: не разбирается frontmatter — ${err.message}`);
    continue;
  }

  // --- формат файла и обязательные поля ---

  if (!/^[a-z0-9-]+\.mdx$/.test(file))
    problems.push(
      `${where}: имя файла должно быть из латиницы, цифр и дефисов (это URL поста)`
    );

  if (typeof data.title !== "string" || !data.title.trim())
    problems.push(`${where}: пустой или отсутствующий title`);

  if (typeof data.excerpt !== "string" || !data.excerpt.trim())
    problems.push(`${where}: пустой или отсутствующий excerpt`);
  else if (data.excerpt.length > 320)
    problems.push(
      `${where}: excerpt ${data.excerpt.length} символов, максимум 320 — он идёт в описание для поиска`
    );

  if (!CATEGORIES.includes(data.category))
    problems.push(
      `${where}: category = ${JSON.stringify(data.category)}, а нужно одно из: ${CATEGORIES.join(", ")}`
    );

  if (typeof data.published !== "boolean")
    problems.push(
      `${where}: published должно быть true или false без кавычек (сейчас ${JSON.stringify(data.published)})`
    );

  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(data.date)))
    problems.push(
      `${where}: date должно быть в формате ГГГГ-ММ-ДД (сейчас ${JSON.stringify(data.date)})`
    );

  if (data.updated && !/^\d{4}-\d{2}-\d{2}$/.test(String(data.updated)))
    problems.push(`${where}: updated должно быть в формате ГГГГ-ММ-ДД`);

  if (data.tags && !Array.isArray(data.tags))
    problems.push(`${where}: tags должно быть списком строк`);

  // --- партнёрские ссылки ---

  const used = [...content.matchAll(/<Partner\s+id=["']([^"']+)["']/g)].map(
    (m) => m[1]
  );

  for (const id of new Set(used)) {
    if (!linkIds.has(id))
      problems.push(
        `${where}: <Partner id="${id}"> — такой ссылки нет в content/links.json`
      );
  }

  const usesSponsored = used.some((id) => sponsoredIds.has(id));
  if (usesSponsored && !/<Disclosure\s*\/?>/.test(content))
    problems.push(
      `${where}: есть партнёрская ссылка, но нет <Disclosure /> — раскрытие обязательно`
    );

  // Голые ссылки на партнёров в обход реестра ломают статистику и подмену URL
  for (const id of sponsoredIds) {
    if (content.includes(`?ref=`) && !used.includes(id)) break;
  }
  if (/\]\(https?:\/\/[^)]*[?&]ref=/.test(content))
    problems.push(
      `${where}: партнёрская ссылка вставлена напрямую. Заведите её в content/links.json и ставьте через <Partner id="…">`
    );

  // --- обложка ---

  if (data.cover) {
    const coverFile = path.join(process.cwd(), "public", data.cover.replace(/^\//, ""));
    if (!fs.existsSync(coverFile))
      problems.push(`${where}: cover указывает на ${data.cover}, но файла нет`);
    else if (!data.coverAlt)
      warnings.push(`${where}: у обложки нет coverAlt — добавьте описание картинки`);
  } else if (data.published) {
    warnings.push(
      `${where}: нет обложки. Сгенерировать: npm run cover -- --slug ${slug} --prompt "…"`
    );
  }

  // --- объём и структура ---

  if (data.published) {
    const body = content.trim();
    const min = MIN_BODY_CHARS[data.category] ?? 1200;
    if (body.length < min)
      warnings.push(
        `${where}: тело ${body.length} символов, для рубрики «${data.category}» ориентир от ${min}`
      );

    if (!/^##\s/m.test(body))
      warnings.push(
        `${where}: нет ни одного подзаголовка ##. Без структуры материал плохо цитируется поиском`
      );
  }
}

// --- дубли заголовков ---

const titles = new Map();
for (const file of files) {
  try {
    const { data } = matter(fs.readFileSync(path.join(POSTS_DIR, file), "utf-8"));
    const key = String(data.title).trim().toLowerCase();
    if (titles.has(key))
      problems.push(
        `content/posts/${file}: заголовок дублирует ${titles.get(key)} — поисковики считают это каннибализацией`
      );
    else titles.set(key, file);
  } catch {
    /* уже отловлено выше */
  }
}

// --- осиротевшие обложки ---

if (fs.existsSync(COVERS_DIR)) {
  const slugs = new Set(files.map((f) => f.replace(/\.mdx$/, "")));
  for (const img of fs.readdirSync(COVERS_DIR)) {
    const base = img.replace(/\.[^.]+$/, "");
    if (!slugs.has(base))
      warnings.push(
        `public/covers/${img}: поста с таким именем нет — обложка осталась от удалённого материала`
      );
  }
}

// --- вывод ---

if (warnings.length > 0) {
  console.log(`\nПредупреждения (${warnings.length}), сборку не блокируют:`);
  warnings.forEach((w) => console.log(`  · ${w}`));
}

if (problems.length > 0) {
  console.error(`\nНайдено проблем: ${problems.length}\n`);
  problems.forEach((p) => console.error(`  • ${p}`));
  console.error("\nСборка остановлена. Исправьте файлы и повторите.\n");
  process.exit(1);
}

const published = files.filter((f) => {
  const { data } = matter(fs.readFileSync(path.join(POSTS_DIR, f), "utf-8"));
  return data.published === true;
}).length;

console.log(
  `\nПроверено постов: ${files.length} (опубликовано ${published}, черновиков ${files.length - published})`
);
