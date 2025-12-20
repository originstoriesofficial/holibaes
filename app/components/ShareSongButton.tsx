"use client";

import React from "react";
import { useComposeCast } from "@coinbase/onchainkit/minikit";
import { Button } from "./Button";

export interface ShareSongButtonProps {
  prompt: string;
  style: string;
  holibaeImageUrl?: string | null;
  videoUrl?: string | null;
  audioUrl?: string | null;
}

export const ShareSongButton: React.FC<ShareSongButtonProps> = ({
  prompt,
  style,
  holibaeImageUrl,
  videoUrl,
  audioUrl,
}) => {
  const { composeCast } = useComposeCast();

  const handleShare = () => {
    const text = `🎶 Just made a ${style} Holibae anthem! "${prompt}" ✨\n\nCreate yours at Holibae Labs!`;

    const media = videoUrl || audioUrl || undefined;
    const embeds: [string] | undefined = media ? [media] : undefined;

    composeCast({ text, embeds });
  };

  const disabled = !videoUrl && !audioUrl;

  return (
    <Button onClick={handleShare} disabled={disabled} variant="secondary" className="w-full">
      {videoUrl ? "📤 Share Holibae" : "🎵 Share Song"}
    </Button>
  );
};
