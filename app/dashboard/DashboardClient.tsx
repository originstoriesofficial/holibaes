"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { sdk } from "@farcaster/miniapp-sdk";

export default function DashboardClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [fid, setFid] = useState<number | null>(null);

  const originHolder = searchParams.get("originHolder") === "1";

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
    <main className="min-h-screen bg-[#b7c3a1] text-[#1f2a1d] px-4 py-6">
      <div className="w-full max-w-sm mx-auto pt-4">
        <div className="rounded-2xl border border-black/10 bg-white/70 backdrop-blur-sm px-6 py-7 space-y-5 text-center shadow-sm">
          <h1 className="text-2xl font-semibold">🎁 Season’s Greetings</h1>

          {originHolder ? (
            <p className="text-sm text-[#2f3d2b]/80 leading-relaxed">
              Welcome, originator ✨<br />
              The Holibae Creator + Music Studio is unlocked.
            </p>
          ) : (
            <p className="text-sm text-[#2f3d2b]/80 leading-relaxed">
              You’ll need at least{" "}
              <span className="font-semibold text-[#b08d2a]">
                3,500 $ORIGINSTORY
              </span>{" "}
              tokens to unlock all Holibae features.
            </p>
          )}

          <div className="flex flex-col gap-3">
            <button
              onClick={() => goTo("/create")}
              className="w-full py-3 rounded-xl bg-[#d4af37] text-[#1f2a1d] font-semibold active:scale-[0.99]"
            >
              🎨 Create a Holibae
            </button>

            <button
              onClick={() => goTo("/music")}
              className="w-full py-3 rounded-xl bg-[#2f3d2b] text-white font-semibold active:scale-[0.99]"
            >
              🎶 Enter Music Studio
            </button>
          </div>
        </div>

        <p className="mt-5 text-center text-xs text-[#2f3d2b]/70">
          Powered by OriginStory • Onchain holiday familiars on Base
        </p>
      </div>
    </main>
  );
}
