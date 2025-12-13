"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAccount } from "wagmi";
import Image from "next/image";
import { ShareSongButton } from "../components/ShareSongButton";
import { Button } from "../components/Button";

const styles = [
  "Lo-fi", "Jazz", "Ambient", "Orchestral", "Fantasy", "Cyberpunk", "Retro", "Funk",
  "Dream Pop", "Gospel", "Neo Soul", "Future Bass", "Ballad", "Pop", "Synthwave",
  "Vaporwave", "Acoustic", "Chillwave", "Shoegaze", "Trance",
];

interface SavedSong {
  id: string;
  createdAt: number;
  prompt: string;
  lyrics: string;
  style: string;
}

export default function MusicClient() {
  const searchParams = useSearchParams();
  const { address } = useAccount();

  // ✅ Force light mode
  useEffect(() => {
    document.documentElement.classList.remove("dark");
    document.documentElement.classList.add("light");
  }, []);

  const [prompt, setPrompt] = useState("a cozy winter holiday vibe with sparkles");
  const [lyrics, setLyrics] = useState("");
  const [style, setStyle] = useState(styles[0]);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
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

    try {
      const fullPrompt = `${prompt} in the style of ${style}.${lyrics ? " Lyrics: " + lyrics : ""}`;
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
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
    } catch {
      setError("Oops! Something went wrong while creating your holiday jam.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSong = () => {
    if (!audioUrl) {
      setError("Generate a song first.");
      return;
    }

    if (typeof window === "undefined") return;

    setSaving(true);
    setError(null);

    try {
      const existingRaw = window.localStorage.getItem(storageKey);
      const existing: SavedSong[] = existingRaw ? JSON.parse(existingRaw) : [];

      const entry: SavedSong = {
        id: crypto.randomUUID(),
        createdAt: Date.now(),
        prompt,
        lyrics,
        style,
      };

      const next = [entry, ...existing].slice(0, 50);
      window.localStorage.setItem(storageKey, JSON.stringify(next));
    } catch {
      setError("Could not save song locally.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--foreground)] px-4 py-10 font-sans">
      <div className="w-full max-w-5xl mx-auto space-y-10">
        <header className="space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-white/70 px-3 py-1 text-xs font-medium">
              🎄 Holibae Music Studio
            </div>
            {originHolder && (
              <span className="text-xs text-muted font-semibold">
                OriginStory holder ✅
              </span>
            )}
          </div>

          <h1 className="text-3xl font-bold">❄️ Compose your Holibae Anthem</h1>
          <p className="text-sm text-muted max-w-xl">
            Describe your Holibae’s holiday mood. We’ll create a magical 60-second seasonal anthem just for them.
          </p>
        </header>

        <div className="grid md:grid-cols-[1.5fr,1fr] gap-8">
          <section className="card p-6 space-y-6">
            <div className="space-y-4">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe the holly-jolly mood"
                className="w-full min-h-[80px] rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-sm text-black placeholder:text-black/40 focus:outline-none focus:ring-2 focus:ring-[var(--gold)]"
              />
              <textarea
                value={lyrics}
                onChange={(e) => setLyrics(e.target.value)}
                placeholder="Optional: write some lyrics (poetic or funny!)"
                className="w-full min-h-[80px] rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-sm text-black placeholder:text-black/40 focus:outline-none focus:ring-2 focus:ring-[var(--gold)]"
              />
              <select
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                className="w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-[var(--gold)]"
              >
                {styles.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <Button onClick={generateSong} disabled={loading}>
              {loading ? "Mixing holiday magic…" : "Generate Holibae Song"}
            </Button>

            {error && <p className="text-sm text-red-700 whitespace-pre-line">{error}</p>}
          </section>

          <section className="card p-6 space-y-4">
            <h2 className="text-sm font-semibold">❄️ Your Holibae</h2>

            <div className="flex items-center gap-4">
              {imageUrlFromCreate ? (
                <div className="w-20 h-20 rounded-xl overflow-hidden border border-[var(--border)] bg-white flex-shrink-0">
                  <Image
                    src={imageUrlFromCreate}
                    alt="Your Holibae"
                    width={80}
                    height={80}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-20 h-20 rounded-xl bg-white/80 border border-[var(--border)] text-xs text-black/50 flex items-center justify-center">
                  Your Holibae
                </div>
              )}

              <div className="flex-1 text-sm">
                <div className="font-medium">{formFromCreate || "Mystery Holibae"}</div>
                <div className="text-muted">
                  Style: <span className="font-semibold">{style}</span>
                </div>
              </div>
            </div>

            {audioUrl ? (
              <div className="space-y-4">
                <audio controls src={audioUrl} className="w-full" />
                <Button onClick={handleSaveSong} disabled={saving}>
                  {saving ? "Saving…" : "Save this jingle"}
                </Button>
                <ShareSongButton style={style} prompt={prompt} />
              </div>
            ) : (
              <p className="text-sm text-muted">Generate a jolly anthem to save and share 🎶</p>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
