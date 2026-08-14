"use client";

import { useState } from "react";

const SHARE_TARGETS = [
  {
    id: "telegram",
    label: "Telegram",
    build: (url: string, title: string) =>
      `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
  },
  {
    id: "x",
    label: "X",
    build: (url: string, title: string) =>
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
  },
  {
    id: "vk",
    label: "VK",
    build: (url: string, title: string) =>
      `https://vk.com/share.php?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`,
  },
  {
    id: "whatsapp",
    label: "WhatsApp",
    build: (url: string, title: string) =>
      `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`,
  },
];

/**
 * Кнопки «Поделиться» + «Скопировать ссылку».
 * Работают без сторонних скриптов: обычные ссылки на share-интенты
 * плюс navigator.clipboard для копирования.
 */
export function ShareActions({
  url,
  title,
}: {
  url: string;
  title: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard может быть недоступен (http/старый браузер) — молча пропускаем
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="mr-1 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-soft">
        Поделиться
      </span>
      {SHARE_TARGETS.map((t) => (
        <a
          key={t.id}
          href={t.build(url, title)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center rounded-full border border-line bg-bg-raised px-4 py-2 font-mono text-[11px] uppercase tracking-[0.12em] text-ink-soft transition-colors hover:border-ink/25 hover:text-ink"
        >
          {t.label}
        </a>
      ))}
      <button
        type="button"
        onClick={copyLink}
        className="inline-flex items-center rounded-full border border-line bg-bg-raised px-4 py-2 font-mono text-[11px] uppercase tracking-[0.12em] text-ink-soft transition-colors hover:border-ink/25 hover:text-ink"
      >
        {copied ? "Скопировано ✓" : "Скопировать ссылку"}
      </button>
    </div>
  );
}
