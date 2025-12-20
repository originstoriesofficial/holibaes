"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAccount } from "wagmi";
import Image from "next/image";
import { moontime } from "../fonts";
import { ShareSongButton } from "../components/ShareSongButton";
import { Button } from "../components/Button";

const styles = [
  "Lo-fi", "Jazz", "Ambient", "Orchestral", "Fantasy", "Cyberpunk", "Retro", "Funk",
  "Dream Pop", "Gospel", "Neo Soul", "Future Bass", "Ballad", "Pop", "Synthwave",
  "Vaporwave", "Acoustic", "Chillwave", "Shoegaze", "Trance",
];

const DEFAULT_PROMPT_SUGGESTION = "a cozy winter holiday vibe with sparkles";

export interface SavedSong {
  id: string;
  createdAt: number;
  prompt: string;
  lyrics: string;
  style: string;
  ipfsHash?: string;
}

export default function MusicClient() {
  const searchParams = useSearchParams();
  const { address } = useAccount();

  useEffect(() => {
    document.documentElement.classList.remove("dark");
    document.documentElement.classList.add("light");
  }, []);

  const [prompt, setPrompt] = useState("");
  const [lyrics, setLyrics] = useState("");
  const [style, setStyle] = useState(styles[0]);

  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);

  const [ipfsUrl, setIpfsUrl] = useState<string | null>(null);
  const [ipfsHash, setIpfsHash] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fid = searchParams.get("fid");
  const formFromCreate = searchParams.get("hollyForm") ?? searchParams.get("animal");
  const imageUrlFromCreate = searchParams.get("imageUrl");
  const originHolder = searchParams.get("originHolder") === "1";

  const storageKey = useMemo(() => {
    if (address) return `holibae_songs_${address.toLowerCase()}`;
    if (fid) return `holibae_songs_fid_${fid}`;
    return "holibae_songs_anon";
  }, [address, fid]);

  const generateSong = async () => {
    if (loading) return;
    setLoading(true);
    setError(null);

    setAudioUrl(null);
    setAudioBlob(null);
    setIpfsUrl(null);
    setIpfsHash(null);

    try {
      const basePrompt = prompt.trim() || DEFAULT_PROMPT_SUGGESTION;
      let fullPrompt = `${basePrompt} in the style of ${style}.`;
      fullPrompt += lyrics.trim()
        ? ` Use these lyrics: ${lyrics.trim()}.`
        : ` Instrumental only, no vocals, no singing, no choir.`;

      const res = await fetch("/api/compose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: fullPrompt,
          music_length_ms: 60000,
          output_format: "mp3_44100_128",
        }),
      });

      if (!res.ok) throw new Error("Failed to generate song");

      const blob = await res.blob();
      setAudioBlob(blob);
      setAudioUrl(URL.createObjectURL(blob));
    } catch (e) {
      console.error(e);
      setError("Song generation failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSong = async () => {
    if (!audioBlob) return setError("Generate a song first.");
    if (!address) return setError("Wallet required.");

    setSaving(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", audioBlob, "holibae-song.mp3");
      formData.append("address", address);
      if (fid) formData.append("fid", fid);
      formData.append("prompt", prompt.trim() || DEFAULT_PROMPT_SUGGESTION);
      formData.append("style", style);
      formData.append("lyrics", lyrics);

      const res = await fetch("/api/save-song", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Pinning failed");

      const data = await res.json();
      const cid = data.ipfsHash || data.cid;
      const url = data.gatewayUrl || data.url;
      if (!cid || !url) throw new Error("Pinata response missing CID or URL");

      setIpfsUrl(url);
      setIpfsHash(cid);

      const localEntry: SavedSong = {
        id: crypto.randomUUID(),
        createdAt: Date.now(),
        prompt: prompt || DEFAULT_PROMPT_SUGGESTION,
        lyrics,
        style,
        ipfsHash: cid,
      };

      if (typeof window !== "undefined") {
        const existingRaw = window.localStorage.getItem(storageKey);
        const existing: SavedSong[] = existingRaw ? JSON.parse(existingRaw) : [];
        const next = [localEntry, ...existing].slice(0, 50);
        window.localStorage.setItem(storageKey, JSON.stringify(next));
      }
    } catch (e) {
      console.error(e);
      setError("Could not save jingle.");
    } finally {
      setSaving(false);
    }
  };

  const effectiveDownloadUrl = audioUrl || ipfsUrl || undefined;

  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--foreground)] px-4 py-10">
      <div className="w-full max-w-5xl mx-auto space-y-10">
        <header className="space-y-5">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-white px-4 py-2 text-sm font-semibold text-[var(--base-blue)]">
              🎄 Holibae Music Studio
            </div>
            {originHolder && (
              <span className="text-sm text-[var(--base-blue)] font-semibold">
                OriginStory holder ✅
              </span>
            )}
          </div>

          <div className="space-y-3">
            <h1 className="text-5xl font-bold text-[var(--base-blue)] tracking-wide">
              ❄️ Your Holibae Anthem ❄️
            </h1>
            <p className="text-base text-[var(--muted)] max-w-2xl leading-relaxed">
              Create your Holibae&apos;s jingle, pin it, and share it on Farcaster.
            </p>
          </div>
        </header>

        <div className="grid md:grid-cols-[1.5fr,1fr] gap-8">
          <section className="card p-8 space-y-6">
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-semibold">Holiday Mood</label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder={DEFAULT_PROMPT_SUGGESTION}
                  className="w-full min-h-[100px] rounded-xl border-2 border-[var(--border)] bg-white px-4 py-3 text-base"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold">Lyrics (Optional)</label>
                <textarea
                  value={lyrics}
                  onChange={(e) => setLyrics(e.target.value)}
                  placeholder="Write some lyrics (poetic or funny!)"
                  className="w-full min-h-[100px] rounded-xl border-2 border-[var(--border)] bg-white px-4 py-3 text-base"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold">Choose Music Style</label>
                <select
                  value={style}
                  onChange={(e) => setStyle(e.target.value)}
                  className="w-full rounded-xl border-2 border-[var(--border)] bg-white px-4 py-3 text-base"
                >
                  {styles.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <Button onClick={generateSong} disabled={loading} className="text-lg">
              {loading ? "🎵 Generating…" : "🎶 Generate Holibae Song"}
            </Button>

            {error && !loading && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg mt-4">
                <p className="text-sm text-red-700 whitespace-pre-line">{error}</p>
              </div>
            )}
          </section>

          <section className="card p-8 space-y-6">
          <h2 className={`${moontime.className} text-4xl text-[var(--base-blue)] leading-tight`}>
  ❄️ Preview
</h2>


            <div className="flex items-center gap-4">
              {imageUrlFromCreate ? (
                <Image
                  src={imageUrlFromCreate}
                  width={96}
                  height={96}
                  alt="Holibae"
                  className="rounded-xl border"
                />
              ) : (
                <div className="w-24 h-24 rounded-xl bg-[var(--silver-light)] border flex items-center justify-center text-xs">
                  No image
                </div>
              )}

              <div className="space-y-1">
                <div className="font-semibold">{formFromCreate || "Mystery Holibae"}</div>
                <div className="text-xs text-[var(--muted)]">Style: {style}</div>
                {ipfsHash && (
                  <div className="text-[10px] break-all text-[var(--muted)]">IPFS: {ipfsHash}</div>
                )}
              </div>
            </div>

            {effectiveDownloadUrl && (
              <div className="bg-[var(--silver-light)] p-4 rounded-xl">
                <audio controls src={effectiveDownloadUrl} className="w-full" />
              </div>
            )}

            {!ipfsUrl && audioBlob && (
              <Button
                onClick={handleSaveSong}
                disabled={saving}
                variant="secondary"
                className="w-full"
              >
                {saving ? "Saving…" : "💾 Save & Share"}
              </Button>
            )}

            {ipfsUrl && (
              <ShareSongButton
                prompt={prompt || DEFAULT_PROMPT_SUGGESTION}
                style={style}
                holibaeImageUrl={imageUrlFromCreate || undefined}
                audioUrl={ipfsUrl}
              />
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
