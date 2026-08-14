#!/usr/bin/env node
/**
 * Генерирует public/feed.xml (RSS 2.0) из content/posts/*.mdx.
 * Запускается перед сборкой; сайт статичный (output: "export"), поэтому
 * feed собирается разово вместе с остальным, а не роут-хендлером.
 *
 * В ленту попадают только опубликованные посты, отсортированные по дате
 * (свежие сверху). Ссылки строятся от SITE_URL (уже включает подпуть репозитория).
 */
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import matter from "gray-matter";

const POSTS_DIR = path.join(process.cwd(), "content", "posts");
const OUT_FILE = path.join(process.cwd(), "public", "feed.xml");

// SITE_URL уже полный (в CI включает подпуть репозитория), как в sitemap.ts.
const SITE_URL = process.env.SITE_URL ?? "https://toharo.space";
const SITE_NAME = "TOHARO LAB";
const SITE_DESC =
  "Личная лаборатория про вайб-кодинг, AI-агентов и автоматизацию.";

function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Убирает MDX-разметку (компоненты <Answer> и т.п.), оставляя читаемый текст. */
function toPlainText(mdx) {
  return mdx
    // MDX-компоненты вроде <Answer>…</Answer> -> просто текст внутри
    .replace(/<\/?[A-Z][A-Za-z]*[^>]*>/g, " ")
    .replace(/```[\s\S]*?```/g, " ") // блоки кода
    .replace(/`([^`]*)`/g, "$1") // инлайн-код
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1") // картинки -> alt
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1") // ссылки -> текст
    .replace(/[#>*_~-]/g, "") // маркеры заголовков/списков/жирности
    .replace(/\s+/g, " ")
    .trim();
}

function postUrl(slug) {
  return `${SITE_URL}/blog/${slug}/`;
}

function readPosts() {
  if (!fs.existsSync(POSTS_DIR)) return [];
  return fs
    .readdirSync(POSTS_DIR)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => {
      const slug = f.replace(/\.mdx$/, "");
      const raw = fs.readFileSync(path.join(POSTS_DIR, f), "utf-8");
      const { data, content } = matter(raw);
      return { slug, frontmatter: data, content };
    })
    .filter((p) => p.frontmatter && p.frontmatter.published)
    .sort((a, b) =>
      a.frontmatter.date < b.frontmatter.date ? 1 : -1
    );
}

function buildFeed(posts) {
  const now = new Date().toUTCString();
  const items = posts
    .map((p) => {
      const { title, excerpt, date, cover } = p.frontmatter;
      const url = postUrl(p.slug);
      const pubDate = new Date(date).toUTCString();
      // RSS 2.0 принимает только RFC-822 даты; UTC-строка корректна.
      const body = toPlainText(p.content).slice(0, 2000);
      const coverTag = cover
        ? `<enclosure url="${esc(SITE_URL + cover)}" type="image/jpeg" length="0" />`
        : "";
      return `    <item>
      <title>${esc(title)}</title>
      <link>${esc(url)}</link>
      <guid isPermaLink="true">${esc(url)}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${esc(excerpt ?? body)}</description>
      ${coverTag}
    </item>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${esc(SITE_NAME)}</title>
    <link>${esc(SITE_URL + "/")}</link>
    <description>${esc(SITE_DESC)}</description>
    <language>ru</language>
    <lastBuildDate>${now}</lastBuildDate>
    <atom:link href="${esc(SITE_URL + "/feed.xml")}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`;
}

const posts = readPosts();
fs.writeFileSync(OUT_FILE, buildFeed(posts), "utf-8");
console.log(`RSS собран: ${posts.length} постов → public/feed.xml`);
