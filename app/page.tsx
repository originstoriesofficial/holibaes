"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { sdk } from "@farcaster/miniapp-sdk";
import { useAccount } from "wagmi";

interface CheckAccessResponse {
  eligible: boolean;
  balance?: string;
  minRequired?: number;
}

const MIN_REQUIRED = 3500;

export default function Home() {
  const router = useRouter();
  const { address, isConnected } = useAccount();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);

  // 🟢 Force light mode (disable dark mode on mobile clients)
  useEffect(() => {
    document.documentElement.classList.remove("dark");
    document.documentElement.classList.add("light");
  }, []);

  // ✅ Notify SDK when ready
  useEffect(() => {
    sdk.actions.ready().catch((err) =>
      console.error("sdk.actions.ready failed:", err)
    );
  }, []);

  const handleEnter = async () => {
    if (loading) return;

    setError(null);
    setLoading(true);

    try {
      const isMiniApp = await sdk.isInMiniApp().catch(() => false);
      if (!isMiniApp) {
        setError(
          "Please open this app in a Mini App–enabled client (Base app / Farcaster client)."
        );
        return;
      }

      if (!isConnected || !address) {
        setError(
          "Base Account wallet is not ready.\nPlease refresh or reopen in the Base app."
        );
        return;
      }

      const res = await fetch(`/api/check-nft?address=${encodeURIComponent(address)}`);
      const data = (await res.json().catch(() => null)) as CheckAccessResponse | null;

      if (!res.ok || !data) {
        setError("Unable to verify originstory token status.");
        return;
      }

      if (typeof data.balance === "string") setBalance(data.balance);

      if (!data.eligible) {
        const min = data.minRequired ?? MIN_REQUIRED;
        setError(
          `Access restricted.\nYou need at least ${min.toLocaleString()} originstory tokens to enter.`
        );
        router.push(`/dashboard?originHolder=0&min=${min}`);
        return;
      }

      router.push("/dashboard?originHolder=1");
    } catch (err) {
      console.error("Check access error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-[var(--bg,#f7e8d0)] text-[var(--foreground)] px-4 py-10 font-sans">
      <div className="w-full max-w-md text-center">

        {/* 🎁 HERO VIDEO */}
        <div className="mb-4 overflow-hidden rounded-2xl shadow bg-[#f7e8d0]">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-[170px] object-cover"
            poster="/holibae-hero.png"
          >
            <source src="/holibae-hero.mp4" type="video/mp4" />
            <img src="/holibae-hero.png" alt="Holibae Hero Fallback" />
          </video>
        </div>

        {/* 🟣 PURPLE + GOLD CARD */}
        <div className="px-6 py-8 space-y-6 rounded-2xl bg-black text-white border border-purple-900 shadow-md">
          <h1 className="text-3xl font-bold font-oswald tracking-tight">
            ❄️ Holibae Labs ❄️
          </h1>

          <p className="text-sm leading-relaxed text-white/80">
            Hold{" "}
            <span className="font-semibold text-[#f5c95d]">
              at least {MIN_REQUIRED.toLocaleString()} $originstory 
            </span>{" "}
            to enter the lab.
          </p>

          <button
            onClick={handleEnter}
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-[#ce19e6] text-[#f5c95d] font-semibold shadow hover:scale-105 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Checking access…" : "Enter Holibae Labs"}
          </button>

          {balance && (
            <p className="text-xs text-white/70">
              Your originstory balance:{" "}
              <span className="font-semibold text-white">
                {Number(balance).toLocaleString()}
              </span>{" "}
              (min required: {MIN_REQUIRED.toLocaleString()})
            </p>
          )}

          {error && (
            <p className="text-sm text-red-500 whitespace-pre-line">{error}</p>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-muted">
          Onchain Fantasia
        </p>
      </div>
    </main>
  );
}
