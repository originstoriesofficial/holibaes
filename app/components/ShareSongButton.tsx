"use client";

import React from "react";
import { useComposeCast } from "@coinbase/onchainkit/minikit";
import { Button } from "./Button";

export interface ShareSongButtonProps {
  style: string;
  prompt: string;
  characterImageUrl?: string | null;
  characterForm?: string | null;
  audioUrl?: string | null; // use IPFS / gateway URL here
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
    const characterInfo = characterForm
      ? ` featuring my ${characterForm} Holibae`
      : "";

    const songLink = audioUrl ? `\n\nListen here: ${audioUrl}` : "";

    const text = `🎶 Just created a ${style} holiday anthem${characterInfo}! "${prompt}" ✨${songLink}\n\nCreate yours at Holibae Labs!`;

    let embeds: [] | [string] | [string, string] | undefined;

    // only embed the Holibae image; audio is a link in text
    if (characterImageUrl) {
      embeds = [characterImageUrl];
    } else {
      embeds = undefined;
    }

    composeCast({ text, embeds });
  };

  const disabled = !audioUrl && !characterImageUrl;

  return (
    <Button onClick={handleShare} variant="secondary" disabled={disabled}>
      🎵 Share Song {characterImageUrl && "+ Holibae"}
    </Button>
  );
};
