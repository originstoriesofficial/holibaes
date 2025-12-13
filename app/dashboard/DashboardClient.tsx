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
    <main className="min-h-screen flex items-center justify-center bg-[var(--bg)] text-[var(--foreground)] px-4 py-10">
      <div className="w-full max-w-md text-center">
        <div className="card px-6 py-8 space-y-6">
          <h1 className="text-3xl font-bold">🎁 Season’s Greetings</h1>

          {originHolder ? (
            <p className="text-muted text-sm leading-relaxed">
              Welcome, originator ✨<br />
              The Holibae Creator + Music Studio is unlocked.
            </p>
          ) : (
            <p className="text-muted text-sm leading-relaxed">
              You’ll need at least{" "}
              <span className="font-semibold gold">3,500 $ORIGINSTORY</span>{" "}
              tokens to unlock all Holibae features.
            </p>
          )}

          <div className="flex flex-col gap-3">
            <button
              onClick={() => goTo("/create")}
              className="bg-[var(--gold)] text-black py-3 rounded-xl font-semibold shadow hover:scale-105 transition-all"
            >
              🎨 Create a Holibae
            </button>

            <button
              onClick={() => goTo("/music")}
              className="bg-[var(--green)] text-white py-3 rounded-xl font-semibold shadow hover:scale-105 transition-all"
            >
              🎶 Enter Music Studio
            </button>
          </div>
        </div>

        <p className="mt-6 text-xs text-muted">
          Powered by ORIGIN STØRIES • Onchain holiday fantasia
        </p>
      </div>
    </main>
  );
}
