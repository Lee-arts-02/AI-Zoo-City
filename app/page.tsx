import { ZooCityBeginBackdrop } from "@/components/shared/ZooCityBeginBackdrop";
import Link from "next/link";

export default function Home() {
  return (
    <div className="relative flex min-h-dvh flex-1 flex-col items-center justify-center overflow-hidden bg-amber-50 px-6 py-16 font-sans">
      <ZooCityBeginBackdrop placement="hero" />
      <main className="relative z-10 w-full max-w-lg rounded-3xl border-4 border-amber-200/90 bg-white/75 p-10 text-center shadow-[8px_8px_0_0_rgba(251,191,36,0.35)] backdrop-blur-md backdrop-saturate-150">
        <h1 className="font-serif text-3xl font-bold text-amber-950">
          AI Zoo City
        </h1>
        <p className="mt-4 font-serif text-lg leading-relaxed text-amber-900/85">
          A seven-step story for young learners about AI, cities, and fair
          choices.
        </p>
        <Link
          href="/zoo-city"
          className="mt-8 inline-flex min-h-[48px] min-w-[200px] items-center justify-center rounded-2xl border-2 border-amber-800 bg-amber-400 px-6 font-serif text-lg font-semibold text-amber-950 shadow-[4px_4px_0_0_rgba(120,53,15,0.25)] transition hover:translate-y-px hover:bg-amber-300"
        >
          Start the story →
        </Link>
      </main>
    </div>
  );
}
