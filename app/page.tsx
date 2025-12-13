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
    <main className="min-h-screen flex items-center justify-center bg-[var(--bg)] text-[var(--foreground)] px-4 py-10">
      <div className="w-full max-w-md text-center">
        <div className="card px-6 py-8 space-y-6">
          <h1 className="text-3xl font-bold">🎁 Holibae Labs</h1>

          <p className="text-muted text-sm leading-relaxed">
            Hold{" "}
            <span className="font-semibold gold">
              at least {MIN_REQUIRED.toLocaleString()} OriginStory tokens
            </span>{" "}
            to enter the lab.
          </p>

          <button
            onClick={handleEnter}
            disabled={loading}
            className="bg-[var(--gold)] text-black py-3.5 w-full rounded-xl font-semibold shadow hover:scale-105 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Checking access…" : "Enter Holibae Labs"}
          </button>

          {balance && (
            <p className="text-xs text-muted">
              Your OriginStory balance:{" "}
              <span className="font-semibold text-[var(--foreground)]">
                {Number(balance).toLocaleString()}
              </span>{" "}
              (min required: {MIN_REQUIRED.toLocaleString()})
            </p>
          )}

          {error && (
            <p className="text-sm text-red-700 whitespace-pre-line">
              {error}
            </p>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-muted">
          Holibaes • Onchain holiday familiars on Base
        </p>
      </div>
    </main>
  );
}
