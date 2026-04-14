export type ZooCityBeginBackdropProps = {
  /**
   * `fill` — full inset inside a rounded parent (certificate); soft and low-contrast.
   * `hero` — full viewport cover on the home page; slight transparency so the page tint shows through.
   */
  placement?: "fill" | "hero";
};

/**
 * Zoo City illustration: hero home background or subtle certificate layer.
 */
export function ZooCityBeginBackdrop({
  placement = "fill",
}: ZooCityBeginBackdropProps) {
  const isHero = placement === "hero";

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
        className={
          isHero
            ? "h-full min-h-full w-full object-cover opacity-[0.60]"
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
