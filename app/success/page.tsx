"use client";

import React, { useEffect } from "react";
import Image from "next/image";

const APP_URL = "https://holibaes.vercel.app"; // match what's in metadata.ts

export default function SuccessPage() {
  useEffect(() => {
    document.documentElement.classList.remove("dark");
    document.documentElement.classList.add("light");
  }, []);

  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--green)] px-4 py-10 flex flex-col items-center justify-center">
      <h1 className="text-3xl sm:text-4xl font-bold mb-4 text-[var(--gold)] text-center">
        🧘‍♂️ Mint Successful!
      </h1>

      <p className="text-center text-sm text-[var(--green)]/80 max-w-md mb-6">
        Your monk is live on Base. Share it with your friends below.
      </p>

      <div className="w-full max-w-xs sm:max-w-sm md:max-w-md mb-6">
        <Image
          src="/og.png"
          alt="Minted character preview"
          width={400}
          height={400}
          className="w-full h-auto rounded-xl border border-[var(--gold)] object-contain shadow-md"
        />
      </div>

      <a
        href={`https://warpcast.com/~/compose?text=${encodeURIComponent(
          "Just minted my Monk on Base 🧘‍♂️ #Basemonks"
        )}&embeds[]=${encodeURIComponent(`${APP_URL}/success`)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block text-sm font-medium rounded-lg bg-[var(--gold)] text-black px-6 py-3 hover:bg-yellow-400 transition"
      >
        🔗 Share on Farcaster
      </a>

      <a
        href="/create"
        className="mt-4 text-sm text-[var(--green)]/70 hover:underline"
      >
        Create another monk →
      </a>
    </main>
  );
}
