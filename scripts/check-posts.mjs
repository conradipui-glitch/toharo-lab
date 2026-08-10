#!/usr/bin/env node
/**
 * Проверяет все посты перед сборкой. Запускается автоматически (prebuild).
 * Если хоть один файл кривой — сборка падает, и на сайт ничего не уезжает.
 */
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import matter from "gray-matter";

const CATEGORIES = ["Статья", "Гайд", "Заметка"];
const POSTS_DIR = path.join(process.cwd(), "content", "posts");

if (!fs.existsSync(POSTS_DIR)) {
  console.log("Папки content/posts нет — пропускаю проверку.");
  process.exit(0);
}

const files = fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith(".mdx"));
const problems = [];

for (const file of files) {
  const where = `content/posts/${file}`;
  let data;

  try {
    ({ data } = matter(fs.readFileSync(path.join(POSTS_DIR, file), "utf-8")));
  } catch (err) {
    problems.push(`${where}: не разбирается frontmatter — ${err.message}`);
    continue;
  }

  if (!/^[a-z0-9-]+\.mdx$/.test(file))
    problems.push(
      `${where}: имя файла должно быть из латиницы, цифр и дефисов (это URL поста)`
    );

  if (typeof data.title !== "string" || !data.title.trim())
    problems.push(`${where}: пустой или отсутствующий title`);

  if (typeof data.excerpt !== "string" || !data.excerpt.trim())
    problems.push(`${where}: пустой или отсутствующий excerpt`);

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
  `Проверено постов: ${files.length} (опубликовано ${published}, черновиков ${files.length - published})`
);
