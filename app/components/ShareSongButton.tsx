"use client";

import React from "react";
import { useComposeCast } from "@coinbase/onchainkit/minikit";
import { Button } from "./Button";

export interface ShareSongButtonProps {
  prompt: string;
  style: string;
  holibaeImageUrl?: string | null;
  videoUrl?: string | null; // Livepeer CDN output (MP4)
}

export const ShareSongButton: React.FC<ShareSongButtonProps> = ({
  prompt,
  style,
  holibaeImageUrl,
  videoUrl,
}) => {
  const { composeCast } = useComposeCast();

  const handleShare = () => {
    const text = `🎶 Just made a ${style} Holibae music video! "${prompt}" ✨\n\nCreate yours at Holibae Labs!`;

    let embeds: [] | [string] | undefined;

    // 🔑 PRIORITIZE VIDEO
    if (videoUrl) {
      embeds = [videoUrl]; // show video player in Warpcast
    } else if (holibaeImageUrl) {
      embeds = [holibaeImageUrl];
    } else {
      embeds = undefined;
    }

    composeCast({ text, embeds });
  };

  const disabled = !videoUrl && !holibaeImageUrl;

  return (
    <Button onClick={handleShare} disabled={disabled} variant="secondary">
      🎥 Share Video {holibaeImageUrl && "+ Holibae"}
    </Button>
  );
};
