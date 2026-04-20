"use client";

import {
  buildShareSnapshotFromGameState,
  encodeShareSnapshot,
  getSharePageTitle,
} from "@/lib/shareSnapshot";
import { useGameState } from "@/lib/gameState";
import QRCode from "react-qr-code";
import { useCallback, useMemo, useState } from "react";

export function Step7SharePanel() {
  const { state } = useGameState();
  const [copied, setCopied] = useState(false);

  const { shareUrl, shareTitle } = useMemo(() => {
    const snap = buildShareSnapshotFromGameState(state, {
      cityName: "Zoo City",
      originalGamePath: "/zoo-city",
    });
    const p = encodeShareSnapshot(snap);
    if (typeof window === "undefined") {
      return { shareUrl: "", shareTitle: getSharePageTitle(snap) };
    }
    return {
      shareUrl: `${window.location.origin}/share?p=${encodeURIComponent(p)}`,
      shareTitle: getSharePageTitle(snap),
    };
  }, [state]);

  const copy = useCallback(async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(false);
    }
  }, [shareUrl]);

  return (
    <div className="w-full max-w-3xl rounded-2xl border border-amber-900/15 bg-gradient-to-b from-amber-50/80 to-white/90 p-6 shadow-inner ring-1 ring-amber-900/5">
      <h3 className="text-center font-serif text-xl font-bold text-amber-950">Share Your Zoo City</h3>
      <p className="mx-auto mt-2 text-center font-serif text-base font-semibold text-amber-950/95">
        {shareTitle}
      </p>
      <p className="mx-auto mt-2 max-w-prose text-center font-serif text-sm leading-relaxed text-amber-900/85">
        Invite a friend to enter your Zoo City. They&apos;ll try a quick identity and see what{' '}
        <em>your</em> redesigned model suggests — then they can build their own city if they like.
      </p>

      <div className="mt-6 flex flex-col items-center gap-6 sm:flex-row sm:items-start sm:justify-center sm:gap-10">
        <div className="flex flex-col items-center rounded-2xl border border-amber-900/10 bg-white p-4 shadow-sm">
          <div className="rounded-lg bg-white p-2 ring-1 ring-stone-200/80">
            {shareUrl ? (
              <QRCode value={shareUrl} size={168} level="M" className="h-auto w-full max-w-[168px]" />
            ) : (
              <div className="flex h-[168px] w-[168px] items-center justify-center font-serif text-xs text-amber-800/60">
                Preparing…
              </div>
            )}
          </div>
          <p className="mt-3 max-w-[12rem] text-center font-serif text-xs text-amber-800/75">
            Scan to enter this Zoo City.
          </p>
        </div>

        <div className="flex w-full max-w-sm flex-col gap-3">
          <button
            type="button"
            onClick={() => void copy()}
            disabled={!shareUrl}
            className="min-h-[48px] rounded-2xl border-2 border-amber-800 bg-amber-400 px-6 font-serif text-lg font-semibold text-amber-950 shadow-sm transition enabled:hover:bg-amber-300 disabled:opacity-40"
          >
            {copied ? "Link copied" : "Copy Share Link"}
          </button>
          <p className="font-serif text-xs leading-relaxed text-amber-900/70">
            Copies a link anyone can open in a browser — no account. It carries a snapshot of how
            you placed animals in the city so friends can experience your version of the model.
          </p>
        </div>
      </div>
    </div>
  );
}
