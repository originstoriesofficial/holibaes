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
        <main className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-900 to-black text-zinc-50 px-4 py-6">
          <div className="w-full max-w-4xl mx-auto space-y-6">
            <div className="h-10 w-40 rounded-full bg-zinc-800/80 mb-2" />
            <div className="h-7 w-64 rounded-full bg-zinc-800/80 mb-4" />
            <div className="grid gap-6 md:grid-cols-[1.4fr,1fr]">
              <div className="h-64 rounded-2xl border border-zinc-800 bg-zinc-950/70" />
              <div className="h-64 rounded-2xl border border-zinc-800 bg-zinc-950/70" />
            </div>
          </div>
        </main>
      }
    >
      <MusicClient />
    </Suspense>
  );
}
