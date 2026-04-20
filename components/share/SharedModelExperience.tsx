"use client";

import {
  decodeSharePayload,
  getSharePageTitle,
  type ShareSnapshotV1,
} from "@/lib/shareSnapshot";
import { ShareVisitorOutcome } from "@/components/share/ShareVisitorOutcome";
import { inferVisitorWithSharedModel } from "@/lib/shareVisitorInference";
import {
  DREAM_JOBS,
  formatLearnerNameForDisplay,
  getAnimalDisplayName,
  getDreamDisplayLabel,
  getResolvedAnimalKey,
  PRESET_ANIMALS,
  SUGGESTED_TRAITS,
} from "@/lib/learnerUtils";
import type { DreamJob, LearnerProfile, PresetAnimal } from "@/types/game";
import Link from "next/link";
import { useMemo, useState } from "react";

type Phase = "form" | "result";

function defaultVisitorState(): Pick<
  LearnerProfile,
  "presetAnimal" | "customAnimal" | "traits" | "dreamJob" | "customDreamJob"
> {
  return {
    presetAnimal: "rabbit",
    customAnimal: "",
    traits: [],
    dreamJob: "artist",
    customDreamJob: "",
  };
}

export function SharedModelExperience({ encodedPayload }: { encodedPayload: string }) {
  const snapshot = useMemo(() => decodeSharePayload(encodedPayload), [encodedPayload]);

  if (!snapshot) {
    return <ShareInvalidFallback />;
  }

  return <SharedModelInner snapshot={snapshot} />;
}

function ShareInvalidFallback() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col justify-center px-4 py-16 text-center">
      <p className="font-serif text-2xl font-semibold text-amber-950">
        This Zoo City link could not be loaded.
      </p>
      <p className="mt-3 font-serif text-amber-900/85">
        The share may be incomplete or expired. Ask your friend for a fresh link, or start your own
        adventure.
      </p>
      <Link
        href="/zoo-city"
        className="mx-auto mt-8 inline-flex min-h-[48px] items-center justify-center rounded-2xl border-2 border-amber-800 bg-amber-400 px-8 font-serif text-lg font-semibold text-amber-950 shadow-sm transition hover:bg-amber-300"
      >
        Go to Zoo City
      </Link>
    </div>
  );
}

function SharedModelInner({ snapshot }: { snapshot: ShareSnapshotV1 }) {
  const [phase, setPhase] = useState<Phase>("form");
  const [visitor, setVisitor] = useState(defaultVisitorState);
  const [result, setResult] = useState<ReturnType<typeof inferVisitorWithSharedModel> | null>(null);
  const [animalHint, setAnimalHint] = useState(false);

  const creatorDisplay =
    snapshot.creatorName === "mystery animal"
      ? "A fellow player"
      : snapshot.creatorName.charAt(0).toUpperCase() + snapshot.creatorName.slice(1);

  const sharePageTitle = getSharePageTitle(snapshot);
  const hostDisplay =
    Object.prototype.hasOwnProperty.call(snapshot, "learnerName") &&
    formatLearnerNameForDisplay(snapshot.learnerName ?? "").length > 0
      ? formatLearnerNameForDisplay(snapshot.learnerName ?? "")
      : creatorDisplay;

  const gameHref = snapshot.originalGamePath;

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const partial: LearnerProfile = {
      name: "",
      ...visitor,
      description: "",
      drawingDataUrl: null,
    };
    if (!getResolvedAnimalKey(partial)) {
      setAnimalHint(true);
      return;
    }
    setAnimalHint(false);
    const inf = inferVisitorWithSharedModel(snapshot, visitor);
    setResult(inf);
    setPhase("result");
  };

  const visitorLabel = useMemo(() => {
    const v: LearnerProfile = {
      name: "",
      ...visitor,
      description: "",
      drawingDataUrl: null,
    };
    return getAnimalDisplayName(v);
  }, [visitor]);

  const dreamLabel = useMemo(() => {
    const v: LearnerProfile = {
      name: "",
      ...visitor,
      description: "",
      drawingDataUrl: null,
    };
    return getDreamDisplayLabel(v);
  }, [visitor]);

  const toggleTrait = (t: string) => {
    setVisitor((prev) => {
      const set = new Set(prev.traits);
      if (set.has(t)) set.delete(t);
      else if (set.size < 3) set.add(t);
      return { ...prev, traits: [...set].sort() };
    });
  };

  const hasCustom = visitor.customAnimal.trim().length > 0 && visitor.presetAnimal === null;

  return (
    <div className="mx-auto w-full max-w-xl px-4 py-10 sm:py-14">
      <header className="text-center">
        <p className="font-serif text-sm font-medium uppercase tracking-[0.2em] text-amber-800/75">
          Shared model
        </p>
        <h1 className="mt-2 font-serif text-3xl font-bold text-amber-950 sm:text-4xl">
          {sharePageTitle}
        </h1>
        <p className="mt-3 font-serif text-base leading-relaxed text-amber-900/85">
          This city was redesigned by another player. Their choices changed how the model reads new
          stories — including yours.
        </p>
      </header>

      {phase === "form" ? (
        <form
          onSubmit={onSubmit}
          className="mt-10 space-y-8 rounded-3xl border border-amber-900/12 bg-white/90 p-6 shadow-inner"
        >
          <p className="text-center font-serif text-lg text-amber-950">
            Try a quick identity — then see what this Zoo City suggests.
          </p>

          <label className="block font-serif text-sm text-amber-900/80">
            Animal type
            <select
              className="mt-1 w-full rounded-xl border border-amber-900/20 bg-white px-3 py-2.5 font-serif text-amber-950"
              value={hasCustom ? "" : visitor.presetAnimal ?? ""}
              onChange={(e) => {
                const v = e.target.value;
                if (v === "") {
                  setVisitor((s) => ({ ...s, presetAnimal: null }));
                  return;
                }
                setVisitor((s) => ({
                  ...s,
                  presetAnimal: v as PresetAnimal,
                  customAnimal: "",
                }));
              }}
            >
              <option value="">I&apos;ll type my own below…</option>
              {PRESET_ANIMALS.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.label}
                </option>
              ))}
            </select>
          </label>

          <label className="block font-serif text-sm text-amber-900/80">
            Or custom animal
            <input
              type="text"
              className="mt-1 w-full rounded-xl border border-amber-900/20 bg-white px-3 py-2.5 font-serif text-amber-950"
              value={visitor.customAnimal}
              onChange={(e) =>
                setVisitor((s) =>
                  e.target.value.trim()
                    ? { ...s, presetAnimal: null, customAnimal: e.target.value }
                    : { ...s, customAnimal: e.target.value },
                )
              }
              placeholder="e.g. Red panda"
            />
          </label>

          <div>
            <p className="font-serif text-sm font-medium text-amber-900/85">Traits (up to 3)</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {SUGGESTED_TRAITS.map((t) => {
                const on = visitor.traits.includes(t);
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => toggleTrait(t)}
                    className={[
                      "rounded-full border px-3 py-1 font-serif text-sm capitalize",
                      on
                        ? "border-amber-700 bg-amber-200 text-amber-950"
                        : "border-amber-900/15 bg-white text-amber-900/80",
                    ].join(" ")}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
          </div>

          <label className="block font-serif text-sm text-amber-900/80">
            Dream role (preset)
            <select
              className="mt-1 w-full rounded-xl border border-amber-900/20 bg-white px-3 py-2.5 font-serif text-amber-950"
              value={visitor.customDreamJob.trim() ? "" : visitor.dreamJob ?? ""}
              onChange={(e) => {
                const v = e.target.value;
                if (!v) return;
                setVisitor((s) => ({
                  ...s,
                  dreamJob: v as DreamJob,
                  customDreamJob: "",
                }));
              }}
            >
              {DREAM_JOBS.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.label}
                </option>
              ))}
            </select>
          </label>

          <label className="block font-serif text-sm text-amber-900/80">
            Or describe your dream in your own words
            <input
              type="text"
              className="mt-1 w-full rounded-xl border border-amber-900/20 bg-white px-3 py-2.5 font-serif text-amber-950"
              value={visitor.customDreamJob}
              onChange={(e) =>
                setVisitor((s) => ({
                  ...s,
                  dreamJob: null,
                  customDreamJob: e.target.value,
                }))
              }
              placeholder="Optional — overrides preset when filled"
            />
          </label>

          {animalHint ? (
            <p className="text-center font-serif text-sm text-amber-900/85">
              Zoo City has not detected that animal yet. Choose a listed animal or type one
              Zoo City knows.
            </p>
          ) : null}

          <button
            type="submit"
            className="w-full rounded-2xl border-2 border-amber-800 bg-amber-400 py-3 font-serif text-lg font-semibold text-amber-950 shadow-sm transition hover:bg-amber-300"
          >
            See what this city suggests
          </button>
        </form>
      ) : (
        result && (
          <div className="space-y-8">
            <ShareVisitorOutcome
              result={result}
              visitorLabel={visitorLabel}
              dreamLabel={dreamLabel}
            />

            <div className="flex flex-col gap-3 rounded-2xl border border-amber-900/10 bg-white/85 p-5 text-center">
              <p className="font-serif text-base font-medium text-amber-950">
                Not the path you wanted?
              </p>
              <p className="font-serif text-sm text-amber-900/80">
                Different people shape different systems. Build your own Zoo City and teach the
                model your values.
              </p>
              <Link
                href={gameHref}
                className="inline-flex min-h-[48px] items-center justify-center rounded-2xl border-2 border-amber-800 bg-amber-400 px-6 font-serif text-lg font-semibold text-amber-950 shadow-sm transition hover:bg-amber-300"
              >
                Build your own Zoo City
              </Link>
            </div>

            <button
              type="button"
              onClick={() => {
                setPhase("form");
                setResult(null);
              }}
              className="w-full rounded-xl border border-amber-900/20 bg-white py-2.5 font-serif text-sm font-medium text-amber-950 hover:bg-amber-50"
            >
              Try another identity
            </button>
          </div>
        )
      )}

      <footer className="mt-12 border-t border-amber-900/10 pt-8 text-center">
        <p className="font-serif text-sm text-amber-900/75">
          This experience uses {hostDisplay}&apos;s shared model snapshot — not the only way a
          city could work.
        </p>
        <Link href={gameHref} className="mt-3 inline-block font-serif text-sm font-semibold text-amber-800 underline-offset-2 hover:underline">
          Open the full AI Zoo City game
        </Link>
      </footer>
    </div>
  );
}
