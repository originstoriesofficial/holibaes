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

  const appUrl = useMemo(() => {
    return process.env.NEXT_PUBLIC_MINIAPP_URL ?? "https://monjeria.vercel.app";
  }, []);

  const handleShare = () => {
    const textLines = [
      `I just composed a Holibae anthem in La Monjería 🎶`,
      `Style: ${style}`,
    ];

    if (prompt?.trim()) {
      textLines.push(`Vibe: ${prompt}`);
    }

    const text = textLines.join("\n");

    composeCast({
      text,
      embeds: [`${appUrl}/music`],
    });
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      className={
        className ??
        "w-full py-2.5 rounded-xl bg-[#ce19e6] hover:bg-[#b215c2] text-white text-xs md:text-sm font-semibold transition-all"
      }
    >
      Share song
    </button>
  );
}
