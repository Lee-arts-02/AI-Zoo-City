"use client";

import { SharedModelExperience } from "@/components/share/SharedModelExperience";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

function SharePageInner() {
  const searchParams = useSearchParams();
  const p = searchParams.get("p") ?? "";
  return <SharedModelExperience encodedPayload={p} />;
}

export default function SharePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center font-serif text-amber-900/80">
          Loading…
        </div>
      }
    >
      <SharePageInner />
    </Suspense>
  );
}
