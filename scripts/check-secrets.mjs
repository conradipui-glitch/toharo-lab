#!/usr/bin/env node
/**
 * Не даёт закоммитить секрет в публичный репозиторий.
 *
 *   node scripts/check-secrets.mjs           # проверить staged-файлы (pre-commit)
 *   node scripts/check-secrets.mjs --all     # проверить всё рабочее дерево
 *
 * Репозиторий публичный: утёкший ключ = скомпрометированный ключ.
 * Отозвать его придётся в любом случае, даже если коммит потом удалить.
 */
import { execSync } from "node:child_process";
import fs from "node:fs";
import process from "node:process";

const ALL = process.argv.includes("--all");

/**
 * Файлы, которых в репозитории быть не должно вообще.
 * Исключение — .env.example: он для того и нужен, чтобы лежать в репозитории,
 * и содержит только имена переменных без значений.
 */
const FORBIDDEN_PATHS = [
  {
    re: /(^|\/)\.env(?!\.example$)($|\.)/,
    why: ".env-файлы хранят ключи и не коммитятся никогда (исключение — .env.example)",
  },
  { re: /(^|\/)id_(rsa|dsa|ecdsa|ed25519)$/, why: "приватный SSH-ключ" },
  { re: /\.(pem|key|pfx|p12|keystore|jks)$/i, why: "файл с приватным ключом или сертификатом" },
  { re: /(^|\/)\.npmrc$/, why: ".npmrc часто содержит токен реестра" },
  { re: /(^|\/)(credentials|secrets?)\.(json|ya?ml|toml|ini)$/i, why: "файл с учётными данными" },
  { re: /(^|\/)\.aws\//, why: "конфигурация AWS с ключами" },
];

/** Содержимое, которое выглядит как секрет. */
const PATTERNS = [
  { re: /-----BEGIN[A-Z ]*PRIVATE KEY-----/, why: "приватный ключ" },
  { re: /\bgh[pousr]_[A-Za-z0-9]{20,}/, why: "токен GitHub" },
  { re: /\bsk-(?:proj-)?[A-Za-z0-9_-]{20,}/, why: "ключ OpenAI" },
  { re: /\bsk-ant-[A-Za-z0-9_-]{20,}/, why: "ключ Anthropic" },
  { re: /\bAKIA[0-9A-Z]{16}\b/, why: "ключ доступа AWS" },
  { re: /\bAIza[0-9A-Za-z_-]{35}\b/, why: "ключ Google API" },
  { re: /\b\d{6,}:AA[A-Za-z0-9_-]{30,}/, why: "токен Telegram-бота" },
  { re: /\bxox[baprs]-[A-Za-z0-9-]{10,}/, why: "токен Slack" },
  {
    // Присваивание секрета литералом: SECRET = "..." длиной от 8 символов.
    re: /\b(?:api[_-]?key|secret|password|passwd|token|private[_-]?key)\b\s*[:=]\s*["'][^"'\s${}]{8,}["']/i,
    why: "похоже на секрет, записанный прямо в коде",
  },
];

/** Файлы, где совпадения — это заведомо примеры, а не настоящие ключи. */
const ALLOWLIST = [
  /^package-lock\.json$/,
  /^scripts\/check-secrets\.mjs$/,
  /^docs\/.*\.md$/,
  /^AGENTS\.md$/,
  /^README\.md$/,
  /^deploy\/README\.md$/,
];

function listFiles() {
  const cmd = ALL
    ? "git ls-files"
    : "git diff --cached --name-only --diff-filter=ACMR";
  return execSync(cmd, { encoding: "utf-8" })
    .split("\n")
    .map((f) => f.trim())
    .filter(Boolean);
}

function isBinary(buf) {
  return buf.includes(0);
}

const problems = [];

for (const file of listFiles()) {
  for (const { re, why } of FORBIDDEN_PATHS) {
    if (re.test(file)) problems.push(`${file}: ${why}`);
  }

  if (ALLOWLIST.some((re) => re.test(file))) continue;
  if (!fs.existsSync(file)) continue;

  const buf = fs.readFileSync(file);
  if (isBinary(buf) || buf.length > 2_000_000) continue;

  const lines = buf.toString("utf-8").split("\n");
  lines.forEach((line, i) => {
    for (const { re, why } of PATTERNS) {
      if (re.test(line)) {
        problems.push(`${file}:${i + 1}: ${why}`);
        break;
      }
    }
  });
}

if (problems.length > 0) {
  console.error("\n[31mКоммит остановлен: похоже на секреты[0m\n");
  problems.forEach((p) => console.error(`  • ${p}`));
  console.error(
    [
      "",
      "Репозиторий публичный. Что делать:",
      "  1. Уберите значение из файла, положите его в .env.local (он в .gitignore)",
      "  2. В коде читайте через process.env.ИМЯ",
      "  3. Если ключ уже утёк куда-то — отзовите и выпустите новый, удаления коммита недостаточно",
      "",
    ].join("\n")
  );
  process.exit(1);
}

console.log(
  ALL
    ? "Секретов не найдено (проверено всё дерево)."
    : "Секретов в staged-файлах не найдено."
);
