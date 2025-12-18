"use client";

import React from "react";
import { useComposeCast } from "@coinbase/onchainkit/minikit";
import { Button } from "./Button";

export interface ShareSongButtonProps {
  style: string;
  prompt: string;
  characterImageUrl?: string | null;
  characterForm?: string | null;
  audioUrl?: string | null; // should be an HTTP/IPFS URL
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
    if (!audioUrl && !characterImageUrl) return;

    const characterInfo = characterForm
      ? ` featuring my ${characterForm} Holibae`
      : "";
    const text = `🎶 Just created a ${style} holiday anthem${characterInfo}! "${prompt}" ✨\n\nCreate yours at Holibae Labs!`;

    let embeds: [] | [string] | [string, string] | undefined;

    if (characterImageUrl && audioUrl) {
      embeds = [characterImageUrl, audioUrl];
    } else if (characterImageUrl) {
      embeds = [characterImageUrl];
    } else if (audioUrl) {
      embeds = [audioUrl];
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
