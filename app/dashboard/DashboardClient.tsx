"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { sdk } from "@farcaster/miniapp-sdk";
import Image from "next/image";

export default function DashboardClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [fid, setFid] = useState<number | null>(null);

  const originHolder = searchParams.get("originHolder") === "1";

  // ✅ Force light mode
  useEffect(() => {
    document.documentElement.classList.remove("dark");
    document.documentElement.classList.add("light");
  }, []);

  useEffect(() => {
    const init = async () => {
      try {
        const isMiniApp = await sdk.isInMiniApp();
        if (!isMiniApp) {
          alert(
            "Please open this app in a Mini App–enabled client (like the Base app or Warpcast)."
          );
          return;
        }

        const context = await sdk.context;
        setFid(context.user?.fid ?? null);
      } catch (err) {
        console.error("Mini App context failed:", err);
      }
    };

    void init();
  }, []);

  const goTo = (path: string) => {
    if (!fid) {
      alert("Missing user data, cannot continue.");
      return;
    }

    const params = new URLSearchParams({
      fid: String(fid),
      originHolder: originHolder ? "1" : "0",
    });

    router.push(`${path}?${params.toString()}`);
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-start bg-[var(--bg,#f7e8d0)] text-[var(--foreground)] px-4 py-10 font-sans">
      <div className="w-full max-w-md text-center">

        {/* 🎁 Hero image at top */}
        <div className="mb-6 overflow-hidden rounded-2xl shadow bg-[#f7e8d0]">
          <Image
            src="/holibae-hero.png"
            alt="Holibae Holiday Hero"
            width={600}
            height={200}
            className="w-full h-[170px] object-cover"
            priority
          />
        </div>

        {/* 🟣 Purple + Gold Card */}
        <div className="px-6 py-8 space-y-6 rounded-2xl bg-black text-white border border-purple-900 shadow-md">
          <h1 className="text-3xl font-bold font-oswald tracking-tight">
            ❄️ Holibae Labs ❄️
          </h1>

          {originHolder ? (
            <p className="text-sm leading-relaxed text-white/80">
              Welcome, originator ✨<br />
              The Holibae Creator + Music Studio is unlocked.
            </p>
          ) : (
            <p className="text-sm leading-relaxed text-white/80">
              You’ll need at least{" "}
              <span className="font-semibold text-[#f5c95d]">3.5k $ORIGINSTORY</span>{" "}
              to unlock all Holibae features.
            </p>
          )}

          <div className="flex flex-col gap-3">
            <button
              onClick={() => goTo("/create")}
              className="bg-[#ce19e6] text-[#f5c95d] py-3 rounded-xl font-semibold shadow hover:scale-105 transition-all"
            >
              🎨 Create a Holibae
            </button>

            <button
              onClick={() => goTo("/music")}
              className="bg-[#ce19e6] text-[#f5c95d] py-3 rounded-xl font-semibold shadow hover:scale-105 transition-all"
            >
              🎶 Enter Music Studio
            </button>
          </div>
        </div>

        <p className="mt-6 text-xs text-black/50 font-medium">
          Powered by ORIGIN STØRIES • Onchain Fantasia
        </p>
      </div>
    </main>
  );
}
