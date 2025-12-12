"use client";

import { useRouter, usePathname } from "next/navigation";
import { useMemo } from "react";

type AppNavActive = "creator" | "studio" | "none";

interface AppNavProps {
  active?: AppNavActive;
}

export function AppNav({ active }: AppNavProps) {
  const router = useRouter();
  const pathname = usePathname();

  const current = useMemo<AppNavActive>(() => {
    if (active) return active;
    if (pathname.startsWith("/create")) return "creator";
    if (pathname.startsWith("/music")) return "studio";
    return "none";
  }, [active, pathname]);

  const goCreator = () => {
    router.push("/create");
  };

  const goStudio = () => {
    router.push("/music");
  };

  const goHome = () => {
    router.push("/login");
  };

  return (
    <nav className="sticky top-0 z-30 mb-4">
      <div className="backdrop-blur bg-zinc-950/80 border border-zinc-800 rounded-2xl px-4 py-2.5 flex items-center justify-between">
        {/* Left: logo only */}
        <button
          type="button"
          onClick={goHome}
          className="flex items-center gap-2 group"
        >
          <div className="h-7 w-7 rounded-xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-base">
            🧸
          </div>
        </button>

        {/* Right: tabs */}
        <div className="flex items-center gap-1 text-[11px] md:text-xs bg-zinc-900/60 rounded-xl p-1 border border-zinc-700">
          <button
            type="button"
            onClick={goCreator}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              current === "creator"
                ? "bg-zinc-100 text-zinc-900"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Creator
          </button>
          <button
            type="button"
            onClick={goStudio}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              current === "studio"
                ? "bg-zinc-100 text-zinc-900"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Studio
          </button>
        </div>
      </div>
    </nav>
  );
}
