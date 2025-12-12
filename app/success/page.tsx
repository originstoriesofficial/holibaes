import type { Metadata } from "next";
import Image from "next/image";

export const dynamic = "force-static";

const APP_URL = "https://basemonks.vercel.app"; // Change to holibaes if needed

export async function generateMetadata(): Promise<Metadata> {
  const imageUrl = `${APP_URL}/og.png`;

  return {
    title: "Monk Minted!",
    description: "Your Monk is now live on Base 🧘‍♂️",
    openGraph: {
      title: "Basemonks — Mint Complete",
      description: "Your monk has been minted successfully.",
      images: [imageUrl],
      url: `${APP_URL}/success`,
    },
    other: {
      "fc:frame": JSON.stringify({
        version: "next",
        imageUrl,
        button: {
          title: "View My Monk",
          action: {
            type: "launch_frame",
            url: `${APP_URL}/create`,
            name: "Basemonks",
            splashImageUrl: `${APP_URL}/icon.png`,
            splashBackgroundColor: "#000000",
          },
        },
      }),
    },
  };
}

export default function SuccessPage() {
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
