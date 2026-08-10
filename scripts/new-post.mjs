#!/usr/bin/env node
/**
 * Создаёт заготовку поста с корректным frontmatter.
 *
 *   node scripts/new-post.mjs --title "Заголовок" --category Гайд [--excerpt "..."]
 *                             [--read-time "8 МИН ЧТЕНИЯ"] [--slug my-slug] [--publish]
 *
 * По умолчанию пост создаётся ЧЕРНОВИКОМ (published: false) — на сайт он не попадёт,
 * пока не будет выставлен published: true.
 */
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const CATEGORIES = ["Статья", "Гайд", "Заметка"];
const POSTS_DIR = path.join(process.cwd(), "content", "posts");

const TRANSLIT = {
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh",
  з: "z", и: "i", й: "y", к: "k", л: "l", м: "m", н: "n", о: "o",
  п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f", х: "h", ц: "c",
  ч: "ch", ш: "sh", щ: "sch", ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya",
};

function slugify(input) {
  return input
    .toLowerCase()
    .split("")
    .map((ch) => TRANSLIT[ch] ?? ch)
    .join("")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function parseArgs(argv) {
  const out = { publish: false };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--publish") {
      out.publish = true;
    } else if (arg.startsWith("--")) {
      const key = arg.slice(2).replace(/-([a-z])/g, (_, c) => c.toUpperCase());
      out[key] = argv[++i];
    }
  }
  return out;
}

function fail(message) {
  console.error(`Ошибка: ${message}`);
  process.exit(1);
}

/** YAML-строка в одинарных кавычках: единственный спецсимвол — сама кавычка. */
function yamlString(value) {
  return `'${String(value).replace(/'/g, "''")}'`;
}

const args = parseArgs(process.argv.slice(2));

if (!args.title) fail('нужен --title "Заголовок поста"');
if (!args.category) fail(`нужен --category, один из: ${CATEGORIES.join(", ")}`);
if (!CATEGORIES.includes(args.category))
  fail(`рубрика "${args.category}" неизвестна. Допустимо: ${CATEGORIES.join(", ")}`);

const slug = slugify(args.slug || args.title);
if (!slug) fail("не удалось построить slug — задайте его явно через --slug");

fs.mkdirSync(POSTS_DIR, { recursive: true });

const filePath = path.join(POSTS_DIR, `${slug}.mdx`);
if (fs.existsSync(filePath))
  fail(`файл уже существует: content/posts/${slug}.mdx`);

const frontmatter = [
  "---",
  `title: ${yamlString(args.title)}`,
  `excerpt: ${yamlString(args.excerpt || "")}`,
  `category: ${yamlString(args.category)}`,
  `readTime: ${yamlString(args.readTime || "5 МИН ЧТЕНИЯ")}`,
  `cover: ''`,
  `date: ${yamlString(new Date().toISOString().slice(0, 10))}`,
  `published: ${args.publish}`,
  "---",
  "",
  "## Первый подзаголовок",
  "",
  "Текст поста в Markdown.",
  "",
].join("\n");

fs.writeFileSync(filePath, frontmatter, "utf-8");

console.log(`Создан: content/posts/${slug}.mdx`);
console.log(`Статус: ${args.publish ? "опубликован" : "черновик"}`);
console.log(`URL после сборки: /blog/${slug}/`);
