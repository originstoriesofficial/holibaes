"use client";

import React from "react";
import { useComposeCast } from "@coinbase/onchainkit/minikit";
import { Button } from "./Button";

export interface ShareSongButtonProps {
  style: string;
  prompt: string;
  characterImageUrl?: string | null;
  characterForm?: string | null;
  audioUrl?: string | null;
}

export const ShareSongButton: React.FC<ShareSongButtonProps> = ({
  style,
  prompt,
  characterImageUrl,
  characterForm,
  audioUrl,
}) => {
  const { composeCast } = useComposeCast();

  const handleShare = () => {
    const characterInfo = characterForm ? ` featuring my ${characterForm} Holibae` : "";
    const text = `🎶 Just created a ${style} holiday anthem${characterInfo}! "${prompt}" ✨\n\nCreate yours at Holibae Labs!`;

    const embeds: [string] | [string, string] | undefined =
      characterImageUrl && audioUrl?.startsWith("http")
        ? [characterImageUrl, audioUrl]
        : characterImageUrl
        ? [characterImageUrl]
        : audioUrl?.startsWith("http")
        ? [audioUrl]
        : undefined;

    composeCast({ text, embeds });
  };

  return (
    <Button onClick={handleShare} variant="secondary">
      🎵 Share Song {characterImageUrl && "+ Holibae"}
    </Button>
  );
};
