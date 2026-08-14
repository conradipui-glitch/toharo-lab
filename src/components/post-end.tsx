import { SITE } from "@/lib/site";
import { TelegramButton } from "./telegram-contact";
import { ShareActions } from "./share-actions";

/**
 * Блок в конце каждой статьи: обсуждение в канале + поделиться.
 * Ссылка ведёт на канал с подпиской — отдельного треда под каждый пост нет.
 */
export function PostEnd({
  url,
  title,
}: {
  url: string;
  title: string;
}) {
  return (
    <div className="mt-12 rounded-2xl border border-line bg-bg-raised p-6">
      <div className="font-display text-[18px] font-bold tracking-[-0.02em]">
        Обсудить
      </div>
      <p className="mt-2 max-w-xl text-[14px] leading-relaxed text-ink-soft">
        Есть что добавить или не согласны? Пишите в канал — там же анонсы новых
        материалов и заметки между постами.
      </p>
      <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <TelegramButton label="Обсудить в Telegram" href={SITE.channel.url} />
        <ShareActions url={url} title={title} />
      </div>
    </div>
  );
}
