"use client";

import React from "react";
import { useComposeCast } from "@coinbase/onchainkit/minikit";
import { Button } from "./Button";

export interface ShareSongButtonProps {
  prompt: string;
  style: string;
  holibaeImageUrl?: string | null;
  videoUrl?: string | null;
}

export const ShareSongButton: React.FC<ShareSongButtonProps> = ({
  prompt,
  style,
  holibaeImageUrl,
  videoUrl,
}) => {
  const { composeCast } = useComposeCast();

  const handleShare = () => {
    const text = `🎶 Just made a ${style} Holibae anthem! "${prompt}" ✨\n\nCreate yours at Holibae Labs!`;

    // ✅ Type must be exactly: [] | [string] | [string, string] | undefined
    let embeds: [] | [string] | [string, string] | undefined;

    // Prioritize video, fallback to image
    if (videoUrl) {
      embeds = [videoUrl]; // Single video embed
    } else if (holibaeImageUrl) {
      embeds = [holibaeImageUrl]; // Single image embed
    } else {
      embeds = undefined; // No embeds
    }

    composeCast({ text, embeds });
  };

  const disabled = !videoUrl && !holibaeImageUrl;

  return (
    <Button onClick={handleShare} disabled={disabled} variant="secondary" className="w-full">
      {videoUrl ? "🎥 Share Video on Farcaster" : "📤 Share Holibae"}
    </Button>
  );
};