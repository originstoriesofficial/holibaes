"use client";

import { useEffect, Suspense } from "react";
import MusicClient from "./MusicClient";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;
export const runtime = "edge";

export default function MusicPage() {
  // ✅ Force light mode for Base / Farcaster
  useEffect(() => {
    document.documentElement.classList.remove("dark");
    document.documentElement.classList.add("light");
  }, []);

  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[var(--bg,#f5f2eb)] text-[var(--foreground)] px-4 py-6 font-sans">
          <div className="w-full max-w-4xl mx-auto space-y-6">
            <div className="h-10 w-40 rounded-full bg-[var(--border)]/40 mb-2" />
            <div className="h-7 w-64 rounded-full bg-[var(--border)]/40 mb-4" />
            <div className="grid gap-6 md:grid-cols-[1.4fr,1fr]">
              <div className="h-64 rounded-2xl border border-[var(--border)] bg-white/60 backdrop-blur" />
              <div className="h-64 rounded-2xl border border-[var(--border)] bg-white/60 backdrop-blur" />
            </div>
          </div>
        </main>
      }
    >
      <main className="min-h-screen bg-[var(--bg,#f5f2eb)] text-[var(--foreground)] px-4 py-6 font-sans">
        <MusicClient />
      </main>
    </Suspense>
  );
}
