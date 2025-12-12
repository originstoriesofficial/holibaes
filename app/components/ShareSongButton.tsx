"use client";

import { useComposeCast } from "@coinbase/onchainkit/minikit";
import { useMemo } from "react";

interface ShareSongButtonProps {
  style: string;
  prompt: string;
  className?: string;
}

export function ShareSongButton({
  style,
  prompt,
  className,
}: ShareSongButtonProps) {
  const { composeCast } = useComposeCast();

  const appUrl = useMemo(
    () => process.env.NEXT_PUBLIC_MINIAPP_URL ?? "https://monjeria.vercel.app",
    []
  );

  const handleShare = () => {
    const textLines: string[] = [
      `I just composed a Holibaes music track in La Monjería 🎶`,
      `Style: ${style}`,
    ];

    if (prompt) {
      textLines.push(`Vibe: ${prompt}`);
    }

    const text = textLines.join("\n");

    // Link people back into the music studio
    const embeds: [string] = [`${appUrl}/music`];

    composeCast({
      text,
      embeds,
    });
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      className={
        className ??
        "w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-xs md:text-sm font-semibold"
      }
    >
      Share song
    </button>
  );
}
