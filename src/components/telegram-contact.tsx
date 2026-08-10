import { SITE, asset } from "@/lib/site";

/** Иконка Telegram — инлайновый SVG, чтобы не тянуть внешние файлы. */
function TelegramIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M21.9 4.3 18.8 19c-.2 1-.9 1.3-1.7.8l-4.7-3.5-2.3 2.2c-.3.3-.5.5-1 .5l.4-4.9 8.9-8c.4-.3-.1-.5-.6-.2L6.9 12.6l-4.7-1.5c-1-.3-1-1 .2-1.5l18.3-7c.9-.3 1.6.2 1.3 1.7z" />
    </svg>
  );
}

/** Кнопка «написать в телеграм». Работает и на телефоне, и на десктопе. */
export function TelegramButton({
  className = "",
  label,
}: {
  className?: string;
  label?: string;
}) {
  return (
    <a
      href={SITE.telegram.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`group inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.12em] text-bg transition-colors hover:bg-accent hover:text-ink ${className}`}
    >
      <TelegramIcon className="h-3.5 w-3.5" />
      {label ?? SITE.telegram.handle}
    </a>
  );
}

/**
 * Блок контакта: кнопка плюс QR.
 *
 * QR скрыт на телефоне намеренно — со своего же экрана его не отсканируешь,
 * там достаточно кнопки. На десктопе наоборот: QR удобнее, чем перепечатывать
 * ник в телефон руками.
 */
export function TelegramContact() {
  return (
    <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
      <div className="flex-1">
        <p className="text-[14px] leading-relaxed text-ink-soft">
          Вопрос по материалу, идея для разбора или предложение — пишите в
          телеграм. Это основной и самый быстрый способ до меня достучаться.
        </p>
        <TelegramButton className="mt-5" />
      </div>

      <div className="hidden shrink-0 flex-col items-center gap-2 sm:flex">
        {/* eslint-disable-next-line @next/next/no-img-element -- статический экспорт, оптимизатор недоступен */}
        <img
          src={asset(SITE.telegram.qr)}
          alt={`QR-код со ссылкой на телеграм ${SITE.telegram.handle}`}
          width={132}
          height={132}
          className="rounded-xl border border-line bg-bg-raised p-2"
        />
        <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-ink-soft">
          Наведите камеру
        </span>
      </div>
    </div>
  );
}
