"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { sdk } from "@farcaster/miniapp-sdk";
import Image from "next/image";
import { moontime } from "../fonts";

export default function DashboardClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [fid, setFid] = useState<number | null>(null);
  const [muted, setMuted] = useState(true); // 🎵 audio state

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
          {originHolder ? (
            <div className="space-y-4 text-center">
              <h1
                className={`${moontime.className} text-5xl text-[var(--base-blue)] leading-tight`}
              >
                ⭐ Welcome originator
              </h1>
              <p className="text-base leading-relaxed text-[var(--muted)]">
                The Holibae Creator + Music Studio is unlocked.
              </p>
            </div>
          ) : (
            <div className="bg-[var(--silver-light)] rounded-xl p-4 border-l-4 border-[var(--base-blue)]">
              <p className="text-base leading-relaxed text-[var(--foreground)]">
                You’ll need at least{" "}
                <span className="font-bold text-[var(--base-blue)] text-lg">
                  3.5k $ORIGINSTORY
                </span>{" "}
                to unlock all Holibae features.
              </p>
            </div>
          )}

          <div className="flex flex-col gap-4 pt-6">
            <button
              onClick={() => goTo("/create")}
              className="btn-primary w-full py-5 rounded-xl text-lg font-semibold shadow-lg hover:scale-105 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              Create a Holibae
            </button>

            <button
              onClick={() => goTo("/music")}
              className="w-full py-5 rounded-xl bg-[var(--base-blue)] text-white text-lg font-semibold shadow-lg hover:scale-105 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              Enter Holibae Labs
            </button>
          </div>
        </div>
      </div>

      {/* 🔈 Holiday Song Player */}
      <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 bg-white border border-[var(--border)] shadow-lg px-4 py-2 rounded-full text-sm">
        <audio
          id="holiday-audio"
          src="/audio/holiday-song.mp3"
          autoPlay
          loop
          muted={muted}
        />
        <span className="text-[var(--muted)]">Holiday music</span>
        <button
          onClick={() => {
            const audio = document.getElementById("holiday-audio") as HTMLAudioElement | null;
            if (audio) {
              audio.muted = !audio.muted;
              setMuted(audio.muted);
            }
          }}
          className="text-[var(--base-blue)] font-semibold hover:underline"
        >
          {muted ? "Unmute" : "Mute"}
        </button>
      </div>
    </main>
  );
}
