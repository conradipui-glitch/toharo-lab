#!/usr/bin/env node
/**
 * Генерирует QR-код на телеграм в SVG и кладёт в public/.
 *
 *   npm run qr
 *
 * Запускается вручную и только при смене контакта — результат коммитится
 * как обычная статика. Так на сайте нет ни внешних запросов (их всё равно
 * заблокирует CSP), ни лишней зависимости в рантайме: qrcode стоит
 * в devDependencies и в собранный сайт не попадает.
 *
 * SVG, а не PNG: масштабируется без потерь и весит меньше.
 */
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import QRCode from "qrcode";

const TARGET = process.argv[2] || "https://t.me/toha_ro";
const OUT = path.join(process.cwd(), "public", "qr-telegram.svg");

// Уровень коррекции M: держит скан при небольших повреждениях и не раздувает код.
// Цвета — тёмный текст сайта на светлой карточке, чтобы QR не выбивался из вёрстки.
const svg = await QRCode.toString(TARGET, {
  type: "svg",
  errorCorrectionLevel: "M",
  margin: 1,
  color: { dark: "#14140f", light: "#fffdf7" },
});

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, svg, "utf-8");

console.log(`QR готов: public/qr-telegram.svg → ${TARGET}`);
console.log(`Размер: ${Math.round(svg.length / 1024)} КБ`);
