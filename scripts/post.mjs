#!/usr/bin/env node
/**
 * Управление существующими постами.
 *
 *   npm run post -- list
 *   npm run post -- show <slug>
 *   npm run post -- set <slug> --title "…" --excerpt "…" --category Гайд
 *                              --read-time "9 МИН ЧТЕНИЯ" --tags "claude code, агенты"
 *   npm run post -- publish <slug>          опубликовать (проставит updated, если уже выходил)
 *   npm run post -- unpublish <slug>        снять с сайта, файл остаётся
 *   npm run post -- rewrite <slug> --file new-body.md    заменить текст целиком
 *   npm run post -- delete <slug>           удалить пост и его обложку
 *
 * Slug менять нельзя: это URL, по нему стоят ссылки. Нужен другой URL —
 * создавайте новый пост и удаляйте старый осознанно.
 */
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import matter from "gray-matter";

const CATEGORIES = ["Статья", "Гайд", "Заметка"];
const POSTS_DIR = path.join(process.cwd(), "content", "posts");
const COVERS_DIR = path.join(process.cwd(), "public", "covers");

function fail(msg) {
  console.error(`Ошибка: ${msg}`);
  process.exit(1);
}

function parseArgs(argv) {
  const out = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--yes") out.yes = true;
    else if (a.startsWith("--")) {
      const key = a.slice(2).replace(/-([a-z])/g, (_, c) => c.toUpperCase());
      out[key] = argv[++i];
    } else out._.push(a);
  }
  return out;
}

const args = parseArgs(process.argv.slice(2));
const [command, slug] = args._;

const today = () => new Date().toISOString().slice(0, 10);
const postPath = (s) => path.join(POSTS_DIR, `${s}.mdx`);

function load(s) {
  if (!s) fail("нужен slug");
  const p = postPath(s);
  if (!fs.existsSync(p)) fail(`поста нет: content/posts/${s}.mdx`);
  const file = matter(fs.readFileSync(p, "utf-8"));
  return { path: p, data: file.data, content: file.content };
}

function save(p, data, content) {
  fs.writeFileSync(p, matter.stringify(content, data), "utf-8");
}

switch (command) {
  case "list": {
    if (!fs.existsSync(POSTS_DIR)) fail("папки content/posts нет");
    const rows = fs
      .readdirSync(POSTS_DIR)
      .filter((f) => f.endsWith(".mdx"))
      .map((f) => {
        const { data } = matter(fs.readFileSync(path.join(POSTS_DIR, f), "utf-8"));
        return {
          slug: f.replace(/\.mdx$/, ""),
          status: data.published ? "опубликован" : "черновик",
          category: data.category,
          date: data.date,
          cover: data.cover ? "есть" : "нет",
          title: data.title,
        };
      })
      .sort((a, b) => (a.date < b.date ? 1 : -1));

    if (rows.length === 0) {
      console.log("Постов нет.");
      break;
    }
    for (const r of rows) {
      console.log(
        `${r.date}  ${r.status.padEnd(12)} ${String(r.category).padEnd(8)} обложка:${r.cover.padEnd(5)} ${r.slug}`
      );
      console.log(`            ${r.title}`);
    }
    console.log(`\nВсего: ${rows.length}`);
    break;
  }

  case "show": {
    const { data, content } = load(slug);
    console.log(JSON.stringify(data, null, 2));
    console.log(`\n--- тело (${content.trim().length} символов) ---\n`);
    console.log(content.trim().slice(0, 600));
    if (content.trim().length > 600) console.log("\n…");
    break;
  }

  case "set": {
    const { path: p, data, content } = load(slug);

    if (args.title) data.title = args.title;
    if (args.excerpt) data.excerpt = args.excerpt;
    if (args.readTime) data.readTime = args.readTime;
    if (args.coverAlt) data.coverAlt = args.coverAlt;
    if (args.canonical) data.canonical = args.canonical;
    if (args.category) {
      if (!CATEGORIES.includes(args.category))
        fail(`рубрика "${args.category}" неизвестна. Есть: ${CATEGORIES.join(", ")}`);
      data.category = args.category;
    }
    if (args.tags)
      data.tags = args.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

    if (data.published) data.updated = today();

    save(p, data, content);
    console.log(`Обновлён: content/posts/${slug}.mdx`);
    if (data.updated) console.log(`Проставлена дата обновления: ${data.updated}`);
    break;
  }

  case "rewrite": {
    if (!args.file) fail("нужен --file путь-к-файлу с новым текстом");
    if (!fs.existsSync(args.file)) fail(`файла нет: ${args.file}`);
    const { path: p, data } = load(slug);
    const body = fs.readFileSync(args.file, "utf-8");
    if (body.trim().length < 500)
      fail("новый текст меньше 500 символов — похоже на ошибку");
    if (data.published) data.updated = today();
    save(p, data, body);
    console.log(`Текст заменён: content/posts/${slug}.mdx (${body.trim().length} символов)`);
    break;
  }

  case "publish": {
    const { path: p, data, content } = load(slug);
    if (data.published) {
      console.log("Пост уже опубликован, проставляю дату обновления.");
      data.updated = today();
    } else {
      data.published = true;
      data.date = data.date || today();
    }
    save(p, data, content);
    console.log(`Опубликован: /blog/${slug}/`);
    break;
  }

  case "unpublish": {
    const { path: p, data, content } = load(slug);
    data.published = false;
    save(p, data, content);
    console.log(`Снят с сайта: ${slug} (файл остался, страница исчезнет после сборки)`);
    break;
  }

  case "delete": {
    const { path: p, data } = load(slug);
    if (!args.yes) {
      console.log(`Будет удалено безвозвратно:`);
      console.log(`  content/posts/${slug}.mdx — «${data.title}»`);
      const cover = path.join(COVERS_DIR, `${slug}.jpg`);
      if (fs.existsSync(cover)) console.log(`  public/covers/${slug}.jpg`);
      console.log(`\nЕсли уверены, повторите с флагом --yes`);
      console.log(`Мягкая альтернатива: npm run post -- unpublish ${slug}`);
      process.exit(1);
    }
    fs.unlinkSync(p);
    const cover = path.join(COVERS_DIR, `${slug}.jpg`);
    if (fs.existsSync(cover)) fs.unlinkSync(cover);
    console.log(`Удалён: ${slug}`);
    console.log(`Ссылка /blog/${slug}/ станет 404. Если на неё ссылались — учтите это.`);
    break;
  }

  default:
    console.log(
      [
        "Команды:",
        "  list                      список всех постов",
        "  show <slug>               показать frontmatter и начало текста",
        "  set <slug> --title …      поменять поля frontmatter",
        "  rewrite <slug> --file f   заменить текст целиком",
        "  publish <slug>            опубликовать",
        "  unpublish <slug>          снять с сайта",
        "  delete <slug> --yes       удалить пост и обложку",
      ].join("\n")
    );
    process.exit(command ? 1 : 0);
}
