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

      const res = await fetch(`/api/check-nft?address=${address}`);
      if (!res.ok) {
        setError("Unable to verify OriginStory token status.");
        return;
      }

      const data = (await res.json()) as CheckAccessResponse;

      if (data.balance) {
        setBalance(data.balance);
      }

      if (!data.eligible) {
        setError(
          `Access restricted.\nYou need at least ${MIN_REQUIRED.toLocaleString()} OriginStory tokens to enter.`
        );
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
    <main className="min-h-screen flex items-center justify-center bg-[var(--bg)] text-[var(--green)] px-4">
      <div className="w-full max-w-md">
        <div className="card px-6 py-8 space-y-6 text-center">
          <h1 className="text-3xl font-bold tracking-tight">🎁 Holibae Labs</h1>

          <p className="text-sm text-muted">
            Hold{" "}
            <span className="font-semibold text-[var(--gold)]">
              at least {MIN_REQUIRED.toLocaleString()} OriginStory tokens
            </span>{" "}
            to enter the lab.
          </p>

          <button
            onClick={handleEnter}
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-[var(--gold)] text-[var(--bg)] font-semibold hover:opacity-90 transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Checking access…" : "Enter Holibae Labs"}
          </button>

          {balance && (
            <p className="text-xs text-muted">
              Your OriginStory balance:{" "}
              <span className="font-semibold text-[var(--green)]">
                {Number(balance).toLocaleString()}
              </span>{" "}
              (min required: {MIN_REQUIRED.toLocaleString()})
            </p>
          )}

          {error && (
            <p className="text-sm text-red-500 whitespace-pre-line">
              {error}
            </p>
          )}
        </div>

        <p className="mt-5 text-center text-xs text-muted">
          Holibaes • Onchain holiday familiars on Base
        </p>
      </div>
    </main>
  );
}
