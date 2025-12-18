"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { sdk } from "@farcaster/miniapp-sdk";
import Image from "next/image";
import { moontime } from "../fonts"; // this now resolves to app/fonts.ts

export default function DashboardClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [fid, setFid] = useState<number | null>(null);

  const originHolder = searchParams.get("originHolder") === "1";

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
    <main className="min-h-screen flex flex-col items-center justify-center bg-[var(--bg)] text-[var(--foreground)] px-4 py-10 font-sans">
      <div className="w-full max-w-md text-center">
        <div className="mb-6 overflow-hidden rounded-2xl shadow-lg">
          <Image
            src="/holibae-hero.png"
            alt="Holibae Holiday Hero"
            width={600}
            height={200}
            className="w-full h-[170px] object-cover"
            priority
          />
        </div>

        <div className="card px-8 py-10 space-y-8">
          <div className="space-y-3">
            <h1 className="text-5xl font-bold font-oswald tracking-wide text-[var(--foreground)] leading-tight">
              ❄️ Holibae Labs
            </h1>
            <div className="h-1 w-20 bg-gradient-to-r from-[var(--base-blue)] to-[var(--silver)] mx-auto rounded-full" />
          </div>

          {originHolder ? (
            <div className="space-y-2">
              <p
                className={`${moontime.className} text-3xl text-[var(--base-blue)] leading-tight`}
              >
                Welcome originator ✨
              </p>
              <p className="text-base leading-relaxed text-[var(--muted)]">
                The Holibae Creator + Music Studio is unlocked.
              </p>
            </div>
          ) : (
            <div className="bg-[var(--silver-light)] rounded-xl p-4 border-l-4 border-[var(--base-blue)]">
              <p className="text-base leading-relaxed text-[var(--foreground)]">
                You&apos;ll need at least{" "}
                <span className="font-bold text-[var(--base-blue)] text-lg">
                  3.5k $ORIGINSTORY
                </span>{" "}
                to unlock all Holibae features.
              </p>
            </div>
          )}

          <div className="flex flex-col gap-4 pt-4">
            <button
              onClick={() => goTo("/create")}
              className="btn-primary w-full py-5 rounded-xl text-lg font-semibold shadow-lg hover:scale-105 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              Create your Holibae
            </button>

            <button
              onClick={() => goTo("/music")}
              className="w-full py-5 rounded-xl bg-[#3c8aff] text-[#0000ff] text-lg font-semibold shadow-lg hover:scale-105 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
               💿 Music Studio
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
