"use client";

import { useEffect, useRef, useState } from "react";

export type BenchRow = {
  id: string;
  name: string;
  vendor: "Claude" | "GPT" | "Gemini";
  task: "game" | "program" | "post";
  chars: number;
  seconds: number | null;
  tokensIn: number | null;
  tokensOut: number | null;
  checks: string;
  verdict: string;
  text: string;
};

const TASK_LABELS: Record<BenchRow["task"], string> = {
  game: "Игра (JS, змейка)",
  program: "Программа (Python, CSV)",
  post: "Пост (Telegram, ИИ)",
};

export const BENCH_ROWS: BenchRow[] = [
  // ===== game =====
  {
    id: "g-37",
    name: "gemini-3.7-flash-medium",
    vendor: "Gemini",
    task: "game",
    chars: 13428,
    seconds: 16.3,
    tokensIn: 15021,
    tokensOut: 4849,
    checks: "5/6 — нет рестарта по пробелу",
    verdict: "Самый быстрый, полный код",
    text: `Вот полный код классической игры «Змейка» в одном HTML-файле с плавным управлением, ускорением по мере набора очков, защитой от случайного разворота назад и экраном конца игры.`,
  },
  {
    id: "g-36",
    name: "gemini-3.6-flash-medium",
    vendor: "Gemini",
    task: "game",
    chars: 17041,
    seconds: 32.3,
    tokensIn: 16288,
    tokensOut: 9705,
    checks: "5/6 — нет рестарта по пробелу",
    verdict: "Медленнее вдвое, код больше",
    text: `Вот полный рабочий код игры «Змейка» на чистом JavaScript в одном HTML-файле. Файл содержит всё необходимое: разметку, современную CSS-стилизацию, логику на canvas.`,
  },
  {
    id: "g-sonnet",
    name: "claude-sonnet-4-6",
    vendor: "Claude",
    task: "game",
    chars: 10444,
    seconds: 54.0,
    tokensIn: 17180,
    tokensOut: 4385,
    checks: "5/6 — нет рестарта по пробелу",
    verdict: "Крепко, но медленно",
    text: `Змейка на canvas с управлением стрелками, счётом, ускорением и экраном game over.`,
  },
  {
    id: "g-opus",
    name: "claude-opus-4-6-thinking",
    vendor: "Claude",
    task: "game",
    chars: 6039,
    seconds: 36.1,
    tokensIn: 17361,
    tokensOut: 2553,
    checks: "6/6 — всё по чек-листу",
    verdict: "Единственный полный (6/6)",
    text: `Игра «Змейка» на canvas: управление стрелками, счёт, скорость растёт, game over и рестарт по пробелу.`,
  },
  {
    id: "g-terra",
    name: "gpt-5.6-terra",
    vendor: "GPT",
    task: "game",
    chars: 4520,
    seconds: 32.2,
    tokensIn: null,
    tokensOut: null,
    checks: "6/6 — всё по чек-листу",
    verdict: "Полный, лаконичный",
    text: `Змейка на canvas с управлением, счётом, ускорением, game over и рестартом по пробелу.`,
  },

  // ===== program =====
  {
    id: "p-37",
    name: "gemini-3.7-flash-medium",
    vendor: "Gemini",
    task: "program",
    chars: 6052,
    seconds: 10.6,
    tokensIn: 15175,
    tokensOut: 2146,
    checks: "5/5",
    verdict: "Самый быстрый, полный",
    text: `Вот полный скрипт на Python, использующий исключительно стандартную библиотеку (csv, datetime, collections).`,
  },
  {
    id: "p-36",
    name: "gemini-3.6-flash-medium",
    vendor: "Gemini",
    task: "program",
    chars: 4566,
    seconds: 11.7,
    tokensIn: 4497,
    tokensOut: 3553,
    checks: "5/5",
    verdict: "Почти так же быстро",
    text: `Вот полный скрипт на Python без внешних зависимостей (используются только модули из стандартной библиотеки: csv, datetime, collections, os).`,
  },
  {
    id: "p-sonnet",
    name: "claude-sonnet-4-6",
    vendor: "Claude",
    task: "program",
    chars: 8571,
    seconds: 38.8,
    tokensIn: 17160,
    tokensOut: 3002,
    checks: "5/5",
    verdict: "Полный, но в 3.5 раза дольше",
    text: `Программа на Python: чтение CSV, группировка по месяцам, суммы и средние, таблица в консоль и отчёт в Markdown.`,
  },
  {
    id: "p-opus",
    name: "claude-opus-4-6-thinking",
    vendor: "Claude",
    task: "program",
    chars: 4518,
    seconds: 24.1,
    tokensIn: 17362,
    tokensOut: 1724,
    checks: "5/5",
    verdict: "Полный, средний по времени",
    text: `Скрипт на Python: CSV → группировка по месяцам → суммы/средние → таблица и Markdown-отчёт.`,
  },
  {
    id: "p-terra",
    name: "gpt-5.6-terra",
    vendor: "GPT",
    task: "program",
    chars: 3669,
    seconds: 27.0,
    tokensIn: null,
    tokensOut: null,
    checks: "5/5",
    verdict: "Лаконичный, средний",
    text: `Python-скрипт: читает CSV, группирует по месяцам, считает сумму и среднее, выводит таблицу и сохраняет отчёт в Markdown.`,
  },

  // ===== post =====
  {
    id: "t-37",
    name: "gemini-3.7-flash-medium",
    vendor: "Gemini",
    task: "post",
    chars: 1004,
    seconds: 7.9,
    tokensIn: 15191,
    tokensOut: 1050,
    checks: "3/3",
    verdict: "Самый быстрый, живой текст",
    text: `Google выкатила Gemini 3.7 Flash — и это явная заявка на лидерство по скорости среди актуальных моделей. Главный фокус релиза — минимальная задержка.`,
  },
  {
    id: "t-36",
    name: "gemini-3.6-flash-medium",
    vendor: "Gemini",
    task: "post",
    chars: 954,
    seconds: 9.8,
    tokensIn: 8315,
    tokensOut: 2771,
    checks: "3/3",
    verdict: "Эмодзи-перебор",
    text: `⚡️ Google представила Gemini 3.7 Flash — новую модель, заточенную под реактивную скорость работы. Главная фишка релиза — минимальная задержка.`,
  },
  {
    id: "t-sonnet",
    name: "claude-sonnet-4-6",
    vendor: "Claude",
    task: "post",
    chars: 866,
    seconds: 13.9,
    tokensIn: 17338,
    tokensOut: 427,
    checks: "3/3",
    verdict: "Крепкий, суховатый",
    text: `Google выпустила Gemini 3.7 Flash — быструю модель с минимальной задержкой ответа.`,
  },
  {
    id: "t-opus",
    name: "claude-opus-4-6-thinking",
    vendor: "Claude",
    task: "post",
    chars: 1013,
    seconds: 14.5,
    tokensIn: 17338,
    tokensOut: 487,
    checks: "3/3",
    verdict: "Лучший текст, но медленный",
    text: `Google представила Gemini 3.7 Flash — модель, которая отвечает почти мгновенно.`,
  },
  {
    id: "t-terra",
    name: "gpt-5.6-terra",
    vendor: "GPT",
    task: "post",
    chars: 777,
    seconds: 9.8,
    tokensIn: null,
    tokensOut: null,
    checks: "3/3",
    verdict: "Лаконичный, живой",
    text: `Google выпустила Gemini 3.7 Flash — быструю модель, которая отвечает почти мгновенно.`,
  },
];

const VENDOR_COLORS: Record<BenchRow["vendor"], string> = {
  Claude: "bg-ink",
  GPT: "bg-accent",
  Gemini: "bg-ink-soft",
};

export function BenchChart() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [task, setTask] = useState<BenchRow["task"]>("post");
  const [metric, setMetric] = useState<"chars" | "seconds">("seconds");
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const rows = BENCH_ROWS.filter((r) => r.task === task);
  const max =
    metric === "chars"
      ? Math.max(...rows.map((r) => r.chars))
      : Math.max(...rows.map((r) => r.seconds ?? 0));

  const fmt = (r: BenchRow) =>
    metric === "chars"
      ? `${r.chars} зн.`
      : r.seconds !== null
        ? `${r.seconds} с`
        : "—";

  const sel = selected ? BENCH_ROWS.find((r) => r.id === selected) : null;

  return (
    <div ref={ref} className="my-8 rounded-2xl border border-line bg-bg-raised p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="font-display text-[15px] font-bold">
          Пять моделей, три задачи
        </div>
        <div className="flex gap-1 rounded-lg border border-line bg-bg p-1 text-[12px]">
          {(
            [
              ["game", "Игра"],
              ["program", "Программа"],
              ["post", "Пост"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTask(key)}
              className={`rounded-md px-2.5 py-1 font-mono transition-colors ${
                task === key ? "bg-ink text-bg" : "text-ink-soft hover:text-ink"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="flex gap-1 rounded-lg border border-line bg-bg p-1 text-[12px]">
          {(
            [
              ["seconds", "Время"],
              ["chars", "Длина"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setMetric(key)}
              className={`rounded-md px-2.5 py-1 font-mono transition-colors ${
                metric === key
                  ? "bg-ink text-bg"
                  : "text-ink-soft hover:text-ink"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2.5">
        {rows.map((r) => {
          const v = metric === "chars" ? r.chars : r.seconds ?? 0;
          const pct = v / max;
          return (
            <button
              key={r.id}
              onClick={() => setSelected(selected === r.id ? null : r.id)}
              className={`grid w-full grid-cols-[190px_1fr_64px] items-center gap-3 rounded-xl p-2 text-left transition-colors ${
                selected === r.id ? "bg-bg" : "hover:bg-bg"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${VENDOR_COLORS[r.vendor]}`} />
                <span className="truncate font-mono text-[12px]">{r.name}</span>
              </div>
              <div className="h-3.5 overflow-hidden rounded-full bg-bg">
                <div
                  className="h-full bg-accent transition-all duration-700"
                  style={{ width: `${Math.max(pct * 100, 2)}%` }}
                />
              </div>
              <div className="text-right font-mono text-[12px]">{fmt(r)}</div>
            </button>
          );
        })}
      </div>

      {sel && (
        <div className="mt-4 rounded-xl border border-line bg-bg p-4">
          <div className="mb-2 flex items-center justify-between gap-3">
            <div className="font-mono text-[13px] font-bold">{sel.name}</div>
            <div className="text-[12px] text-ink-soft">{sel.verdict}</div>
          </div>
          <div className="mb-2 text-[12px] text-ink-soft">
            {TASK_LABELS[sel.task]} · {sel.chars} зн. · {sel.seconds} с · чек-лист {sel.checks}
          </div>
          <p className="whitespace-pre-line text-[13px] leading-relaxed">{sel.text}</p>
        </div>
      )}
    </div>
  );
}
