import React from "react";
import { useComposeCast } from "@coinbase/onchainkit/minikit";
import { Button } from "./Button";

interface ShareSongButtonProps {
  style: string;
  prompt: string;
  characterImageUrl?: string | null;
  characterForm?: string | null;
}

export function ShareSongButton({ 
  style, 
  prompt, 
  characterImageUrl,
  characterForm 
}: ShareSongButtonProps) {
  const { composeCast } = useComposeCast();

  const handleShare = () => {
    const characterInfo = characterForm ? ` featuring my ${characterForm} Holibae` : "";
    const text = `🎶 Just created a ${style} holiday anthem${characterInfo}! "${prompt}" ✨\n\nCreate yours at Holibae Labs!`;
    
    if (characterImageUrl) {
      composeCast({ text, embeds: [characterImageUrl] });
    } else {
      composeCast({ text });
    }
  };

  return (
    <Button onClick={handleShare} variant="secondary">
      🎵 Share Song {characterImageUrl && "+ Holibae"}
    </Button>
  );
}