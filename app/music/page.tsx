"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";

export default function MusicClient() {
  const params = useSearchParams();
  const router = useRouter();

  const hollyForm = params.get("hollyForm");
  const imageUrl = params.get("imageUrl");
  const originHolder = params.get("originHolder") === "1";
  const fid = params.get("fid");

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // ✅ Light mode
    document.documentElement.classList.remove("dark");
    document.documentElement.classList.add("light");

    // ✅ Basic validation
    if (!imageUrl || !hollyForm) {
      setError("Missing Holibae data. Please return to create your Holibae.");
    }
  }, [imageUrl, hollyForm]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg,#f5f2eb)] px-4 py-6 text-center text-red-600">
        <div>
          <p className="text-lg font-semibold mb-4">{error}</p>
          <button
            onClick={() => router.push("/create")}
            className="underline text-blue-600 hover:text-blue-800"
          >
            Go to Holibae Creator
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <header className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-[#ce19e6] font-[Oswald]">🎶 Holibae Music Studio</h1>
        <p className="text-sm text-muted">
          {originHolder
            ? "Because you hold OriginStory tokens, your Holibae gets a custom music vibe!"
            : "Let’s pair your Holibae with some onchain vibes!"}
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-[1.4fr,1fr] items-center">
        <div className="w-full overflow-hidden border border-[var(--border)] rounded-xl bg-white/90 flex justify-center">
          <Image
            src={imageUrl!}
            alt="Holibae"
            width={400}
            height={400}
            className="object-contain max-h-[60vh]"
            priority
          />
        </div>

        <div className="p-4 rounded-xl border border-[var(--border)] bg-white/80 backdrop-blur space-y-4 text-sm text-black/80">
          <p><strong>Form:</strong> {hollyForm}</p>
          {/* Add additional inputs or customization here */}
          <p>✨ Music features coming soon!</p>
        </div>
      </div>
    </div>
  );
}
