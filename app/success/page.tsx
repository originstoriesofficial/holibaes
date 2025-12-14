"use client";

import React, { useEffect } from "react";
import Image from "next/image";

const APP_URL = "https://holibaes.vercel.app"; // match what's in metadata.ts

export default function SuccessPage() {
  // ✅ Force light mode in Farcaster/Base app
  useEffect(() => {
    document.documentElement.classList.remove("dark");
    document.documentElement.classList.add("light");
  }, []);

  return (
    <main className="min-h-screen bg-[var(--bg,#f5f2eb)] text-[var(--foreground)] px-4 py-10 flex flex-col items-center justify-center text-center">
      <h1 className="text-3xl sm:text-4xl font-bold mb-4 text-[#ce19e6] font-[Oswald] tracking-wide">
        ❄️ Mint Successful! ❄️
      </h1>

      <p className="text-sm text-muted max-w-md mb-6">
        Your Holibae is live on Base. Share it with your friends below.
      </p>

      <div className="w-full max-w-xs sm:max-w-sm md:max-w-md mb-6">
        <Image
          src="/og.png"
          alt="Minted Holibae preview"
          width={400}
          height={400}
          className="w-full h-auto rounded-xl border border-[var(--gold)] object-contain shadow-md"
        />
      </div>

      <a
        href={`https://warpcast.com/~/compose?text=${encodeURIComponent(
          "Just summoned my Holibae on Base ✨ #HolibaeLabs"
        )}&embeds[]=${encodeURIComponent(`${APP_URL}/success`)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block text-sm font-semibold rounded-lg bg-[#ce19e6] text-[var(--gold)] px-6 py-3 hover:opacity-90 transition"
      >
        🔗 Share on Farcaster
      </a>

      <a
        href="/create"
        className="mt-4 text-sm text-muted hover:underline"
      >
        Create another Holibae →
      </a>
    </main>
  );
}
