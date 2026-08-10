#!/usr/bin/env node
/**
 * Генерирует обложку для поста и прописывает её в frontmatter.
 *
 *   npm run cover -- --slug my-post --prompt "описание картинки на английском"
 *   npm run cover -- --slug my-post --prompt "..." --format square
 *   npm run cover -- --slug my-post --prompt "..." --provider openai
 *
 * Провайдеры:
 *   pollinations (по умолчанию) — без ключа, выдаёт точные размеры
 *   openai                      — нужен OPENAI_API_KEY в окружении, НЕ в репозитории
 *
 * Размер берётся из формата, а не задаётся руками: картинка должна родиться
 * в тех пропорциях, в которых ляжет в блок.
 */
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import matter from "gray-matter";

const FORMATS = {
  cover: { width: 1600, height: 900 },
  square: { width: 1200, height: 1200 },
  wide: { width: 1680, height: 720 },
};

/** Ближайшие размеры, которые реально принимает gpt-image-1. */
const OPENAI_SIZES = {
  cover: "1536x1024",
  square: "1024x1024",
  wide: "1536x1024",
};

const POSTS_DIR = path.join(process.cwd(), "content", "posts");
const COVERS_DIR = path.join(process.cwd(), "public", "covers");

function parseArgs(argv) {
  const out = { provider: "pollinations", format: "cover", force: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--force") out.force = true;
    else if (a.startsWith("--")) out[a.slice(2)] = argv[++i];
  }
  return out;
}

function fail(msg) {
  console.error(`Ошибка: ${msg}`);
  process.exit(1);
}

const args = parseArgs(process.argv.slice(2));

if (!args.slug) fail("нужен --slug (имя файла поста без .mdx)");
if (!args.prompt) fail('нужен --prompt "описание картинки"');

const spec = FORMATS[args.format];
if (!spec) fail(`формат "${args.format}" неизвестен. Есть: ${Object.keys(FORMATS).join(", ")}`);

const postPath = path.join(POSTS_DIR, `${args.slug}.mdx`);
if (!fs.existsSync(postPath)) fail(`поста нет: content/posts/${args.slug}.mdx`);

const outPath = path.join(COVERS_DIR, `${args.slug}.jpg`);
if (fs.existsSync(outPath) && !args.force)
  fail(`обложка уже есть: public/covers/${args.slug}.jpg (перезаписать: --force)`);

async function viaPollinations(prompt, { width, height }) {
  const url =
    `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}` +
    `?width=${width}&height=${height}&nologo=true&model=flux`;
  console.log(`Генерирую через Pollinations (${width}×${height})…`);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Pollinations ответил ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

async function viaOpenAI(prompt, format) {
  const key = process.env.OPENAI_API_KEY;
  if (!key)
    throw new Error(
      "нет OPENAI_API_KEY в окружении. Положите его в .env.local (файл не коммитится) " +
        "или экспортируйте в сессии. В репозиторий ключ класть нельзя."
    );
  const size = OPENAI_SIZES[format];
  console.log(`Генерирую через OpenAI gpt-image-1 (${size})…`);
  const res = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({ model: "gpt-image-1", prompt, size, n: 1 }),
  });
  if (!res.ok) throw new Error(`OpenAI ответил ${res.status}: ${await res.text()}`);
  const data = await res.json();
  const b64 = data?.data?.[0]?.b64_json;
  if (!b64) throw new Error("OpenAI не вернул изображение");
  return Buffer.from(b64, "base64");
}

try {
  fs.mkdirSync(COVERS_DIR, { recursive: true });

  const bytes =
    args.provider === "openai"
      ? await viaOpenAI(args.prompt, args.format)
      : await viaPollinations(args.prompt, spec);

  if (bytes.length < 1000) throw new Error("ответ подозрительно маленький, картинки нет");

  fs.writeFileSync(outPath, bytes);

  // Прописываем обложку и alt в frontmatter.
  // В alt идёт описание по-русски для скринридеров и поиска, а НЕ англоязычный
  // промпт: промпт описывает стиль картинки, а не её смысл для читателя.
  const file = matter(fs.readFileSync(postPath, "utf-8"));
  file.data.cover = `/covers/${args.slug}.jpg`;
  if (args.alt) file.data.coverAlt = args.alt;
  else if (!file.data.coverAlt)
    file.data.coverAlt = `Иллюстрация к материалу «${file.data.title}»`;
  fs.writeFileSync(postPath, matter.stringify(file.content, file.data), "utf-8");

  const kb = Math.round(bytes.length / 1024);
  console.log(`Готово: public/covers/${args.slug}.jpg (${kb} КБ)`);
  console.log(`cover: ${file.data.cover}`);
  console.log(`coverAlt: ${file.data.coverAlt}`);
  if (!args.alt)
    console.log(`Подсказка: точнее описать картинку можно через --alt "…"`);
} catch (err) {
  fail(err.message);
}
