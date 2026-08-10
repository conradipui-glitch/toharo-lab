import "server-only";
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import type { Category, Post, PostFrontmatter } from "./post-schema";

export * from "./post-schema";

const POSTS_DIR = path.join(process.cwd(), "content", "posts");

function ensureDir() {
  if (!fs.existsSync(POSTS_DIR)) {
    fs.mkdirSync(POSTS_DIR, { recursive: true });
  }
}

function resolvePath(slug: string): string | null {
  const filePath = path.join(POSTS_DIR, `${slug}.mdx`);
  const resolved = path.resolve(filePath);
  if (!resolved.startsWith(path.resolve(POSTS_DIR) + path.sep)) return null;
  return resolved;
}

export function getAllSlugs(): string[] {
  ensureDir();
  return fs
    .readdirSync(POSTS_DIR)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => f.replace(/\.mdx$/, ""));
}

export function getPost(slug: string): Post | null {
  ensureDir();
  const filePath = resolvePath(slug);
  if (!filePath || !fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);
  return { ...(data as PostFrontmatter), slug, content };
}

export function getAllPosts({ includeUnpublished = false } = {}): Post[] {
  return getAllSlugs()
    .map((slug) => getPost(slug))
    .filter((p): p is Post => p !== null)
    .filter((p) => includeUnpublished || p.published)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getPostsByCategory(category: Category): Post[] {
  return getAllPosts().filter((p) => p.category === category);
}

/**
 * Слаги только опубликованных постов.
 * Именно это должно попадать в generateStaticParams: если отдать сюда черновик,
 * его заголовок утечёт в статический HTML, даже когда страница отвечает 404.
 */
export function getPublishedSlugs(): string[] {
  return getAllPosts().map((p) => p.slug);
}

export function savePost(
  slug: string,
  frontmatter: PostFrontmatter,
  content: string
): boolean {
  ensureDir();
  const filePath = resolvePath(slug);
  if (!filePath) return false;
  fs.writeFileSync(filePath, matter.stringify(content, frontmatter), "utf-8");
  return true;
}

export function deletePost(slug: string) {
  const filePath = resolvePath(slug);
  if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
}
