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
 *   openai                      — нужен ключ в окружении, НЕ в репозитории
 *
 * Переменные окружения для провайдера openai (кладутся в .env.local или
 * экспортируются в сессии — файл .env.local в .gitignore):
 *   OPENAI_API_KEY      ключ (обязательно)
 *   OPENAI_BASE_URL     базовый URL, если ключ от агрегатора или прокси,
 *                       а не напрямую от OpenAI. По умолчанию https://api.openai.com/v1
 *   OPENAI_IMAGE_MODEL  модель, по умолчанию gpt-image-1.
 *                       Переопределяется флагом --model
 *
 * Размер берётся из формата, а не задаётся руками: картинка должна родиться
 * в тех пропорциях, в которых ляжет в блок.
 */
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import matter from "gray-matter";
import sharp from "sharp";

/**
 * Подхватывает .env.local, если он есть. Файл в .gitignore и в репозиторий
 * не попадает — это единственное место для ключей.
 * Уже заданные переменные окружения не перетираем.
 */
function loadEnvLocal() {
  const file = path.join(process.cwd(), ".env.local");
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, "utf-8").split("\n")) {
    const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)$/i);
    if (!m) continue;
    const key = m[1];
    const value = m[2].trim().replace(/^["']|["']$/g, "");
    if (!(key in process.env)) process.env[key] = value;
  }
}

loadEnvLocal();

const FORMATS = {
  cover: { width: 1600, height: 900 },
  square: { width: 1200, height: 1200 },
  wide: { width: 1680, height: 720 },
};

/**
 * Размеры, которые принимают модели изображений OpenAI: список фиксированный,
 * произвольные пропорции запросить нельзя. Берём ближайший по форме и
 * обрезаем результат до целевого формата функцией fitToFormat.
 */
const OPENAI_SIZES = {
  cover: "1536x1024", // 3:2 → обрежется до 16:9
  square: "1024x1024",
  wide: "1536x1024", // 3:2 → обрежется до 21:9
};

/**
 * Приводит картинку к точным размерам формата.
 *
 * Нужно потому, что провайдер отдаёт свои фиксированные пропорции, а правило
 * проекта — изображение должно родиться в тех пропорциях, в которых ляжет
 * в блок. Иначе браузер обрежет его по object-cover как попало и с картинки
 * уедет смысловой центр.
 *
 * Кроп по центру: генеративные модели держат композицию в середине кадра.
 */
async function fitToFormat(bytes, { width, height }) {
  const img = sharp(bytes);
  const meta = await img.metadata();

  if (meta.width === width && meta.height === height) return bytes;

  return img
    .resize(width, height, { fit: "cover", position: "centre" })
    .jpeg({ quality: 86, mozjpeg: true })
    .toBuffer();
}

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

async function viaOpenAI(prompt, format, modelOverride) {
  const key = process.env.OPENAI_API_KEY;
  if (!key)
    throw new Error(
      "нет OPENAI_API_KEY в окружении. Положите его в .env.local (файл не коммитится) " +
        "или экспортируйте в сессии. В репозиторий ключ класть нельзя."
    );

  // Ключ может быть от агрегатора или прокси, а не напрямую от OpenAI
  const baseUrl = (process.env.OPENAI_BASE_URL || "https://api.openai.com/v1").replace(/\/+$/, "");
  const model = modelOverride || process.env.OPENAI_IMAGE_MODEL || "gpt-image-1";
  const size = OPENAI_SIZES[format];

  console.log(`Генерирую через ${model} на ${baseUrl} (${size})…`);

  const res = await fetch(`${baseUrl}/images/generations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({ model, prompt, size, n: 1 }),
  });

  if (!res.ok) {
    const body = await res.text();
    // В теле ошибки ключа не бывает, но URL и модель подсказывают, где искать
    throw new Error(
      `${baseUrl} ответил ${res.status}: ${body.slice(0, 400)}\n` +
        `Модель: ${model}. Если ключ от агрегатора — задайте OPENAI_BASE_URL и OPENAI_IMAGE_MODEL.`
    );
  }

  const data = await res.json();
  const item = data?.data?.[0];

  // Одни провайдеры возвращают base64, другие — ссылку на файл
  if (item?.b64_json) return Buffer.from(item.b64_json, "base64");
  if (item?.url) {
    const img = await fetch(item.url);
    if (!img.ok) throw new Error(`не удалось скачать картинку по ссылке: ${img.status}`);
    return Buffer.from(await img.arrayBuffer());
  }

  throw new Error("провайдер не вернул ни b64_json, ни url");
}

try {
  fs.mkdirSync(COVERS_DIR, { recursive: true });

  const raw =
    args.provider === "openai"
      ? await viaOpenAI(args.prompt, args.format, args.model)
      : await viaPollinations(args.prompt, spec);

  if (raw.length < 1000) throw new Error("ответ подозрительно маленький, картинки нет");

  // Приводим к точным пропорциям формата, какой бы размер ни отдал провайдер
  const bytes = await fitToFormat(raw, spec);
  const meta = await sharp(bytes).metadata();
  if (meta.width !== spec.width || meta.height !== spec.height)
    throw new Error(
      `не удалось привести к ${spec.width}×${spec.height}, получилось ${meta.width}×${meta.height}`
    );

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
  console.log(`Готово: public/covers/${args.slug}.jpg (${spec.width}×${spec.height}, ${kb} КБ)`);
  console.log(`cover: ${file.data.cover}`);
  console.log(`coverAlt: ${file.data.coverAlt}`);
  if (!args.alt)
    console.log(`Подсказка: точнее описать картинку можно через --alt "…"`);
} catch (err) {
  fail(err.message);
}
