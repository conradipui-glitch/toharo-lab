import { IMAGE_FORMATS, type ImageFormat } from "@/lib/images";

/**
 * Обложка поста. Если картинки нет — рисует градиентную заглушку,
 * чтобы сетка карточек не разъезжалась.
 *
 * width/height проставлены всегда: без них браузер не резервирует место
 * и страница дёргается при загрузке.
 */
export function CoverImage({
  src,
  alt,
  format = "cover",
  className = "",
  displayRatio,
  priority = false,
}: {
  src?: string;
  alt?: string;
  format?: ImageFormat;
  className?: string;
  /** Пропорции в вёрстке, если отличаются от исходных (карточка режет 16:9 → 16:10). */
  displayRatio?: string;
  priority?: boolean;
}) {
  const spec = IMAGE_FORMATS[format];
  const ratio = displayRatio ?? spec.ratio;

  if (!src) {
    return (
      <div
        className={`w-full rounded-xl border border-line ${className}`}
        style={{
          aspectRatio: ratio,
          background:
            "radial-gradient(120% 100% at 15% 10%, rgba(201,255,61,0.35) 0%, rgba(247,244,236,1) 60%)",
        }}
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- статический экспорт, оптимизатор недоступен
    <img
      src={src}
      alt={alt ?? ""}
      width={spec.width}
      height={spec.height}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      className={`w-full rounded-xl border border-line object-cover ${className}`}
      style={{ aspectRatio: ratio }}
    />
  );
}
