"use client";

import { useEffect, useRef, useState } from "react";

export type PoolRow = {
  id: string;
  name: string;
  vendor: "Claude" | "GPT" | "Gemini" | "API";
  chars: number;
  seconds: number | null;
  tokensOut: number | null;
  tokensIn: number | null;
  cost: string | null;
  verdict: string;
  text: string;
};

export const POOL_ROWS: PoolRow[] = [
  {
    id: "opus46",
    name: "claude-opus-4-6-thinking",
    vendor: "Claude",
    chars: 1011,
    seconds: 15.8,
    tokensOut: 488,
    tokensIn: 19900,
    cost: null,
    verdict: "Победитель: лучший хук, точность, без воды",
    text: `Семь ИИ-поисковиков получили один запрос — и ни один домен не совпал у всех семерых. Вообще ни один.

Хабр провёл замер: Perplexity, нейропоиск Яндекса, ChatGPT, Gemini, DeepSeek, GLM, Grok. Считали не качество текста, а конкретику — какие домены движок реально процитировал в ответе. Больше половины доменов в выдаче назвал ровно один движок из семи. При этом DeepSeek, GLM и Gemini вернули дословно одинаковый список из восьми доменов — оказалось, веб-поиск у них делает один и тот же провайдер. Три «разные» модели, один корпус.

Ещё интереснее с картиной мира. На вопрос «к кому обратиться» один движок выдаёт конкретных людей, другой — агрегаторы вроде profi.ru, третий — госпорталы. Это не баг, это разные индексы и разная логика ранжирования.

Для бизнеса вывод неприятный: универсального способа попасть в ИИ-ответ не существует. Считать надо не модели, а индексы — их куда меньше, чем брендов на обложке.

Вопрос на подумать: если ваш сайт видит только один движок из семи — вы в выдаче или уже нет? 🤔`,
  },
  {
    id: "sonnet46",
    name: "claude-sonnet-4-6",
    vendor: "Claude",
    chars: 1084,
    seconds: 13.5,
    tokensOut: 502,
    tokensIn: 19897,
    cost: null,
    verdict: "Крепкий запасной",
    text: `Семь ИИ-поисковиков не назвали ни одного общего домена в одинаковом запросе — вообще ни одного.

Хабр опубликовал замер: один запрос — семь движков (Perplexity, Яндекс, ChatGPT, Gemini, DeepSeek, GLM, Grok). Считали не текст ответа, а конкретные процитированные домены. Результат жёсткий: пересечение пустое. Больше половины доменов в каждом из двух запросов упомянул ровно один движок. При этом DeepSeek, GLM и Gemini вернули дословно одинаковый список из восьми доменов — потому что веб-поиск им делает один и тот же плагин провайдера.

У движков со своим индексом — разные картины мира. На один и тот же вопрос один отвечает конкретными людьми, другой — агрегаторами вроде Avito, третий — госпорталами.

Главный вывод для тех, кто думает об ИИ-видимости: считать надо не модели, а индексы. Универсального способа попасть в ИИ-ответ не существует. И отдельный нюанс — домен процитирован не значит бренд назван словами: это разные события.

Если ваш сайт видит только один из семи движков — это не баг выдачи, а её устройство.`,
  },
  {
    id: "terra",
    name: "gpt-5.6-terra (max)",
    vendor: "GPT",
    chars: 860,
    seconds: null,
    tokensOut: 8620,
    tokensIn: null,
    cost: null,
    verdict: "Плотный, суховат",
    text: `Семь ИИ-поисковиков — и ни одного общего источника в ответах.

На Хабре проверили одинаковые запросы в Perplexity, Яндекс, ChatGPT, Gemini, DeepSeek, GLM и Grok. Смотрели не на формулировки, а на домены, которые движки реально цитируют. Пересечение оказалось пустым: сайта, которому доверяют все семеро, не нашлось. Более половины доменов в обоих запросах упоминал только один движок — 54% и 63%.

Есть и важная оговорка: DeepSeek, GLM и Gemini выдали дословно один список из восьми доменов. Причина не в магическом согласии моделей, а в том, что веб-поиск им делает общий плагин провайдера. Три бренда — один корпус.

У движков со своим индексом — разные картины мира: на вопрос «к кому обратиться» один отвечает конкретными людьми, другой — агрегаторами (profi.ru, avito.ru), третий — госпорталами (мойбизнес.рф).

Вывод: считать надо не модели, а индексы. Универсального способа попасть в ИИ-ответ нет.`,
  },
  {
    id: "luna",
    name: "gpt-5.6-luna (medium)",
    vendor: "GPT",
    chars: 1085,
    seconds: null,
    tokensOut: 4295,
    tokensIn: null,
    cost: null,
    verdict: "С водой",
    text: `Семь ИИ-поисковиков ответили на один и тот же запрос — и ни один сайт не оказался общим для всех. Звучит как случайность, но это закономерность.

Что происходило на самом деле? Хабр задал одинаковые вопросы семи движкам: Perplexity, нейропоиск Яндекса, ChatGPT, Gemini, DeepSeek, GLM и Grok. Считали не качество текста, а конкретные домены, которые движок процитировал. Результат: ни одного совпадения у всех семерых. Больше половины доменов (54% и 63%) упомянул ровно один движок.

Самое интересное — DeepSeek, GLM и Gemini выдали абсолютно одинаковый список из восьми доменов. Оказалось, веб-поиск у них делает один общий плагин провайдера. Три разных бренда — один и тот же поисковый движок внутри.

А у тех, у кого свой индекс, — свои представления о мире: кто-то советует конкретных людей, кто-то агрегаторы, кто-то госпорталы.

Вывод простой: для бизнеса универсального способа попасть в ИИ-ответ не существует. Считать нужно не модели, а индексы — именно они определяют, увидит ли вас движок.`,
  },
  {
    id: "gemini36",
    name: "gemini-3.6-flash-medium",
    vendor: "Gemini",
    chars: 982,
    seconds: 9.5,
    tokensOut: 2668,
    tokensIn: 18638,
    cost: null,
    verdict: "Клише и эмодзи",
    text: `🤖 Разные ИИ-поисковики живут в абсолютно разных вселенных. На Хабре провели эксперимент: отправили один и тот же запрос семи движкам — Perplexity, Яндекс, ChatGPT, Gemini, DeepSeek, GLM и Grok.

🔥 Результат шокирует: ни одного общего источника! Пересечение пустое. Больше половины доменов (54% и 63%) назвал ровно один движок. А DeepSeek, GLM и Gemini выдали дословно одинаковый список из восьми доменов — потому что у них общий плагин провайдера. Три «разных» поисковика — один и тот же поиск внутри.

💡 Вывод: считать надо не модели, а индексы. У движков со своим индексом — разные картины мира: один советует людей, другой — агрегаторы, третий — госпорталы.

📌 Для бизнеса это значит: универсального способа попасть в ИИ-ответ не существует. Проверяйте, какие индексы реально видят ваш сайт!`,
  },
  {
    id: "routerai",
    name: "claude-sonnet-5 (API)",
    vendor: "API",
    chars: 1011,
    seconds: null,
    tokensOut: null,
    tokensIn: null,
    cost: "2.67 ₽",
    verdict: "Платный резерв, 3 правки длины",
    text: `Семь ИИ-поисковиков получили один и тот же запрос — и ни один домен не встретился у всех семерых сразу.

Хабр прогнал замер: Perplexity, нейропоиск Яндекса, ChatGPT, Gemini, DeepSeek, GLM и Grok. Считали не слова, а домены, которые движок реально процитировал. Итог: пересечение пустое. Больше половины доменов (54% и 63%) упомянул ровно один движок из семи.

Отдельно зацепило: DeepSeek, GLM и Gemini вернули дословно одинаковый список из восьми доменов. Оказалось, веб-поиск им делает один общий плагин провайдера. Три «разных» поисковика — один корпус.

У движков со своим индексом — разные картины мира. На вопрос «к кому обратиться» один отвечает конкретными людьми, другой — агрегаторами (profi.ru, avito.ru), третий — госпорталами (мойбизнес.рф).

Главный вывод: для бизнеса универсального способа попасть в ИИ-ответ не существует. Считать надо не модели, а индексы — их меньше, чем кажется.`,
  },
];

const VENDOR_COLORS: Record<PoolRow["vendor"], string> = {
  Claude: "bg-ink",
  GPT: "bg-accent",
  Gemini: "bg-ink-soft",
  API: "bg-accent",
};

export function PoolChart() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [metric, setMetric] = useState<"chars" | "seconds" | "tokens">("chars");

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

  const max =
    metric === "chars"
      ? Math.max(...POOL_ROWS.map((r) => r.chars))
      : metric === "seconds"
        ? Math.max(...POOL_ROWS.map((r) => r.seconds ?? 0))
        : Math.max(...POOL_ROWS.map((r) => r.tokensOut ?? 0));

  const fmt = (r: PoolRow) =>
    metric === "chars"
      ? `${r.chars} зн.`
      : metric === "seconds"
        ? r.seconds !== null
          ? `${r.seconds} с`
          : "—"
        : r.tokensOut !== null
          ? `${r.tokensOut.toLocaleString("ru")}`
          : "—";

  return (
    <div
      ref={ref}
      className="my-8 rounded-2xl border border-line bg-bg-raised p-5"
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="font-display text-[15px] font-bold">Шесть моделей, одна задача</div>
        <div className="flex gap-1 rounded-lg border border-line bg-bg p-1 text-[12px]">
          {(
            [
              ["chars", "Длина"],
              ["seconds", "Время"],
              ["tokens", "Токены"],
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
        {POOL_ROWS.map((r, i) => {
          const v = metric === "chars" ? r.chars : metric === "seconds" ? r.seconds ?? 0 : r.tokensOut ?? 0;
          const pct = v / max;
          return (
            <div key={r.id} className="grid grid-cols-[190px_1fr_64px] items-center gap-3">
              <div className="truncate font-mono text-[11px] text-ink-soft" title={r.name}>
                {r.name}
              </div>
              <div className="h-4 overflow-hidden rounded-sm bg-bg">
                <div
                  className={`h-full rounded-sm ${VENDOR_COLORS[r.vendor]}`}
                  style={{
                    width: visible ? `${Math.max(4, pct * 100)}%` : "0%",
                    transition: `width 0.9s cubic-bezier(0.22,1,0.36,1) ${i * 90}ms`,
                  }}
                />
              </div>
              <div className="text-right font-mono text-[11px] text-ink">
                {fmt(r)}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-3 flex flex-wrap gap-3 text-[11px] text-ink-soft">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-sm bg-ink" /> Claude
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-sm bg-accent border border-line" /> GPT / API
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-sm bg-ink-soft" /> Gemini
        </span>
      </div>
    </div>
  );
}

export function ModelVersions() {
  const [active, setActive] = useState(POOL_ROWS[0].id);
  const row = POOL_ROWS.find((r) => r.id === active)!;

  return (
    <div className="my-8 overflow-hidden rounded-2xl border border-line bg-bg-raised">
      <div className="border-b border-line bg-bg px-4 py-2 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-soft">
        Один промпт · шесть текстов
      </div>
      <div className="flex flex-wrap gap-1 border-b border-line p-3">
        {POOL_ROWS.map((r) => (
          <button
            key={r.id}
            onClick={() => setActive(r.id)}
            className={`rounded-md px-2.5 py-1.5 font-mono text-[11px] transition-colors ${
              active === r.id
                ? "bg-ink text-bg"
                : "text-ink-soft hover:bg-bg hover:text-ink"
            }`}
          >
            {r.name}
          </button>
        ))}
      </div>
      <div className="p-4">
        <div className="mb-3 flex flex-wrap gap-x-4 gap-y-1 font-mono text-[11px] text-ink-soft">
          <span>{row.chars} зн.</span>
          {row.seconds !== null && <span>{row.seconds} с</span>}
          {row.tokensOut !== null && <span>{row.tokensOut.toLocaleString("ru")} ток. выхода</span>}
          {row.cost && <span>{row.cost}</span>}
          <span className={row.id === "opus46" ? "font-bold text-ink" : ""}>{row.verdict}</span>
        </div>
        <p className="whitespace-pre-line font-serif text-[15px] leading-relaxed text-ink">
          {row.text}
        </p>
      </div>
    </div>
  );
}
