#!/usr/bin/env node
/**
 * Приводит существующие обложки к нужным пропорциям.
 *
 *   npm run covers:fit          посмотреть, что не так (ничего не меняет)
 *   npm run covers:fit -- --write   обрезать по центру и перезаписать
 *
 * Нужно, когда картинка пришла не из скрипта генерации: провайдер отдал свой
 * фиксированный размер, картинку положили руками, поменялся формат в
 * src/lib/images.ts. Перегенерация при этом не требуется и ключ не нужен.
 *
 * Кроп по центру: композиция генеративных картинок обычно в середине кадра.
 * Если после обрезки с картинки ушло важное — её надо перегенерировать,
 * а не тянуть кропом.
 */
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import sharp from "sharp";

// Соответствует IMAGE_FORMATS.cover в src/lib/images.ts
const TARGET = { width: 1600, height: 900 };

const COVERS_DIR = path.join(process.cwd(), "public", "covers");
const WRITE = process.argv.includes("--write");

if (!fs.existsSync(COVERS_DIR)) {
  console.log("Папки public/covers нет — нечего проверять.");
  process.exit(0);
}

const files = fs.readdirSync(COVERS_DIR).filter((f) => /\.(jpe?g|png|webp)$/i.test(f));
if (files.length === 0) {
  console.log("Обложек нет.");
  process.exit(0);
}

let needFix = 0;

for (const file of files) {
  const full = path.join(COVERS_DIR, file);
  // Читаем в буфер, а не передаём путь: иначе sharp держит файл открытым
  // и перезапись того же файла падает на Windows
  const input = fs.readFileSync(full);
  const meta = await sharp(input).metadata();

  if (meta.width === TARGET.width && meta.height === TARGET.height) {
    console.log(`  ok        ${file} (${meta.width}×${meta.height})`);
    continue;
  }

  needFix++;

  if (!WRITE) {
    console.log(
      `  требует   ${file} (${meta.width}×${meta.height} → ${TARGET.width}×${TARGET.height})`
    );
    continue;
  }

  const before = input.length;
  const buf = await sharp(input)
    .resize(TARGET.width, TARGET.height, { fit: "cover", position: "centre" })
    .jpeg({ quality: 86, mozjpeg: true })
    .toBuffer();

  fs.writeFileSync(full, buf);
  console.log(
    `  обрезано  ${file} (${meta.width}×${meta.height} → ${TARGET.width}×${TARGET.height}, ` +
      `${Math.round(before / 1024)} → ${Math.round(buf.length / 1024)} КБ)`
  );
}

if (needFix === 0) {
  console.log("\nВсе обложки в нужных пропорциях.");
} else if (!WRITE) {
  console.log(`\nТребуют обрезки: ${needFix}. Применить: npm run covers:fit -- --write`);
} else {
  console.log(`\nОбрезано: ${needFix}. Проверьте глазами, не ушло ли с картинок важное.`);
}
