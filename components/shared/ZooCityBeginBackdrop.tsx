export type ZooCityBeginBackdropProps = {
  /**
   * `fill` — full inset inside a rounded parent (certificate); soft and low-contrast.
   * `hero` — full viewport cover on the home page; slight transparency so the page tint shows through.
   */
  placement?: "fill" | "hero";
  /** Hero only: image opacity 0–1 (animated from parent for intro sequences). */
  heroOpacity?: number;
  /** Hero only: blur radius in px (e.g. 3 → 0 for “clearing” the scene). */
  heroBlurPx?: number;
};

/**
 * Zoo City illustration: hero home background or subtle certificate layer.
 */
export function ZooCityBeginBackdrop({
  placement = "fill",
  heroOpacity,
  heroBlurPx,
}: ZooCityBeginBackdropProps) {
  const isHero = placement === "hero";
  const opacity = isHero ? (heroOpacity ?? 0.6) : undefined;
  const blurPx = isHero ? (heroBlurPx ?? 0) : undefined;

  return (
    <div
      className={
        isHero
          ? "pointer-events-none absolute inset-0 min-h-dvh w-full overflow-hidden"
          : "pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]"
      }
      aria-hidden
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/zoo-city-begin.png"
        alt=""
        style={
          isHero
            ? {
                opacity,
                filter: `blur(${blurPx ?? 0}px)`,
                transition:
                  "opacity 1000ms ease-out, filter 1000ms ease-out",
              }
            : undefined
        }
        className={
          isHero
            ? "h-full min-h-full w-full object-cover"
            : "h-full w-full object-cover opacity-[0.1] blur-sm"
        }
      />
      {!isHero ? (
        <div
          className="absolute inset-0 bg-gradient-to-b from-white/20 via-white/10 to-amber-50/15"
          aria-hidden
        />
      ) : null}
    </div>
  );
}
