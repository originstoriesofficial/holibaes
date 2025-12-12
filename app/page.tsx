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

      const res = await fetch(
        `/api/check-nft?address=${encodeURIComponent(address)}`
      );

      const data = (await res.json().catch(() => null)) as
        | CheckAccessResponse
        | null;

      if (!res.ok || !data) {
        setError("Unable to verify OriginStory token status.");
        return;
      }

      if (typeof data.balance === "string") setBalance(data.balance);

      if (!data.eligible) {
        const min = data.minRequired ?? MIN_REQUIRED;
        setError(
          `Access restricted.\nYou need at least ${min.toLocaleString()} OriginStory tokens to enter.`
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
    <main className="min-h-screen bg-[#b7c3a1] text-[#1f2a1d] px-4 py-6">
      <div className="w-full max-w-md mx-auto pt-4">
        <div className="rounded-2xl border border-black/10 bg-white/70 backdrop-blur-sm px-6 py-7 space-y-6 text-center shadow-sm">
          <h1 className="text-3xl font-semibold tracking-tight">
            🎁 Holibae Labs
          </h1>

          <p className="text-sm text-[#2f3d2b]/80 leading-relaxed">
            Hold{" "}
            <span className="font-semibold text-[#b08d2a]">
              at least {MIN_REQUIRED.toLocaleString()} OriginStory tokens
            </span>{" "}
            to enter the lab.
          </p>

          <button
            onClick={handleEnter}
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-[#d4af37] text-[#1f2a1d] font-semibold active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Checking access…" : "Enter Holibae Labs"}
          </button>

          {balance && (
            <p className="text-xs text-[#2f3d2b]/70">
              Your OriginStory balance:{" "}
              <span className="font-semibold text-[#1f2a1d]">
                {Number(balance).toLocaleString()}
              </span>{" "}
              (min required: {MIN_REQUIRED.toLocaleString()})
            </p>
          )}

          {error && (
            <p className="text-sm text-red-700 whitespace-pre-line">{error}</p>
          )}
        </div>

        <p className="mt-5 text-center text-xs text-[#2f3d2b]/70">
          Holibaes • Onchain holiday familiars on Base
        </p>
      </div>
    </main>
  );
}
