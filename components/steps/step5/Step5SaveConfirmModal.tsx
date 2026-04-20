"use client";

export type Step5SaveConfirmModalProps = {
  open: boolean;
  notAdjustedCount: number;
  onGoBack: () => void;
  onContinueSaving: () => void;
};

export function Step5SaveConfirmModal({
  open,
  notAdjustedCount,
  onGoBack,
  onContinueSaving,
}: Step5SaveConfirmModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[600] flex items-center justify-center bg-stone-950/55 px-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="save-confirm-title"
    >
      <div className="w-full max-w-md rounded-3xl border-2 border-rose-200/90 bg-[#fdfbf7] p-6 shadow-2xl ring-1 ring-rose-900/10">
        <h2 id="save-confirm-title" className="font-serif text-xl font-bold text-rose-950">
          Double-check before saving
        </h2>
        <p className="mt-4 font-serif leading-relaxed text-stone-800">
          You still have{" "}
          <span className="font-semibold text-rose-900">
            {notAdjustedCount} animal{notAdjustedCount === 1 ? "" : "s"}
          </span>{" "}
          not yet adjusted (you haven&apos;t placed or moved them from the starting layout).
        </p>
        <p className="mt-3 font-serif leading-relaxed text-stone-800">
          After you save your city, your decisions will be final and cannot be changed.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onGoBack}
            className="min-h-[48px] rounded-2xl border-2 border-stone-300 bg-white px-5 font-serif font-semibold text-stone-800 shadow-sm transition hover:bg-stone-50"
          >
            Go Back
          </button>
          <button
            type="button"
            onClick={onContinueSaving}
            className="min-h-[48px] rounded-2xl border-2 border-rose-800 bg-rose-500 px-5 font-serif font-semibold text-white shadow-sm transition hover:bg-rose-400"
          >
            Continue Saving
          </button>
        </div>
      </div>
    </div>
  );
}
