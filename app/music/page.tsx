// app/music/page.tsx
import { Suspense } from "react";
import MusicClient from "./MusicClient";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;
export const runtime = "edge";

export default function MusicPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[var(--bg)] text-[var(--foreground)] px-4 py-10">
          <div className="w-full max-w-5xl mx-auto space-y-10">
            <div className="space-y-5">
              <div className="h-10 w-64 rounded-full bg-[var(--silver-light)] animate-pulse" />
              <div className="h-12 w-96 rounded-lg bg-[var(--silver-light)] animate-pulse" />
              <div className="h-4 w-80 rounded-full bg-[var(--silver-light)] animate-pulse" />
            </div>
            <div className="grid gap-8 md:grid-cols-[1.5fr,1fr]">
              <div className="h-96 rounded-2xl border border-[var(--border)] bg-white shadow animate-pulse" />
              <div className="h-96 rounded-2xl border border-[var(--border)] bg-white shadow animate-pulse" />
            </div>
          </div>
        </main>
      }
    >
      <MusicClient />
    </Suspense>
  );
}