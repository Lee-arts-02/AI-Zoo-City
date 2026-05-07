import type { AnimalProfileCardData } from "@/lib/profileFeatures";

type AnimalProfileCardProps = {
  profile: AnimalProfileCardData;
  title?: string;
  compact?: boolean;
  hideDream?: boolean;
  className?: string;
};

function featureValue(value: string | null | undefined): string {
  return value && value.trim().length > 0 ? value : "Waiting...";
}

export function AnimalProfileCard({
  profile,
  title = "Animal Profile",
  compact = false,
  hideDream = false,
  className = "",
}: AnimalProfileCardProps) {
  return (
    <article
      className={[
        "overflow-hidden rounded-3xl border-4 border-amber-300 bg-gradient-to-br from-white via-amber-50 to-orange-50 shadow-[6px_6px_0_0_rgba(217,119,6,0.18)]",
        compact ? "p-4" : "p-5 sm:p-6",
        className,
      ].join(" ")}
    >
      <p className="text-center font-serif text-xs font-bold uppercase tracking-[0.18em] text-amber-800/80">
        {title}
      </p>
      <div className="mt-3 flex items-center justify-center gap-3">
        <span className={compact ? "text-3xl" : "text-4xl"} aria-hidden>
          {profile.emoji}
        </span>
        <div className="min-w-0">
          <p className="font-serif text-lg font-black text-amber-950 sm:text-xl">
            {featureValue(profile.animal)}
          </p>
          <p className="font-serif text-xs font-semibold uppercase tracking-wide text-amber-700/80">
            data card
          </p>
        </div>
      </div>

      <section className="mt-4 rounded-2xl border-2 border-sky-200 bg-sky-50/85 p-3">
        <p className="mb-2 font-serif text-xs font-bold uppercase tracking-wide text-sky-900/75">
          Classifier features
        </p>
        <dl className="space-y-1.5 font-serif text-sm text-sky-950">
          <div className="flex justify-between gap-3">
            <dt className="text-sky-800/75">Diet</dt>
            <dd className="text-right font-semibold">{featureValue(profile.diet)}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-sky-800/75">Size</dt>
            <dd className="text-right font-semibold">{featureValue(profile.size)}</dd>
          </div>
        </dl>
        <p className="mt-2 rounded-xl bg-white/70 px-3 py-2 text-xs font-semibold text-sky-900">
          The classifier sees size and diet.
        </p>
      </section>

      {!hideDream ? (
        <section className="mt-3 rounded-2xl border-2 border-orange-200 bg-orange-50/85 p-3">
          <p className="font-serif text-xs font-bold uppercase tracking-wide text-orange-900/75">
            Human dream
          </p>
          <p className="mt-1 font-serif text-sm font-semibold text-orange-950">
            Your Dream: {featureValue(profile.dreamJob)}
          </p>
        </section>
      ) : null}
    </article>
  );
}
