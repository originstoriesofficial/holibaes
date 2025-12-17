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
              ❄️ Compose your Holibae Anthem
            </h1>
            <div className="h-1 w-24 bg-gradient-to-r from-[var(--base-blue)] to-[var(--silver)] rounded-full"></div>
          </div>

          <p className="text-base text-[var(--muted)] max-w-2xl leading-relaxed">
            Describe your Holibae's holiday mood. We'll create a magical 60-second seasonal anthem just for them.
          </p>
        </header>

        <div className="grid md:grid-cols-[1.5fr,1fr] gap-8">
          {/* SONG CREATION */}
          <section className="card p-8 space-y-6">
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[var(--foreground)]">Holiday Mood</label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe the holly-jolly mood"
                  className="w-full min-h-[100px] rounded-xl border-2 border-[var(--border)] bg-white px-4 py-3 text-base"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-[var(--foreground)]">Lyrics (Optional)</label>
                <textarea
                  value={lyrics}
                  onChange={(e) => setLyrics(e.target.value)}
                  placeholder="Write some lyrics (poetic or funny!)"
                  className="w-full min-h-[100px] rounded-xl border-2 border-[var(--border)] bg-white px-4 py-3 text-base"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-[var(--foreground)]">Music Style</label>
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
              {loading ? "🎵 Mixing holiday magic…" : "🎶 Generate Holibae Song"}
            </Button>

            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}
          </section>

          {/* HOLIBAE PREVIEW */}
          <section className="card p-8 space-y-6">
            <h2 className="text-lg font-bold text-[var(--base-blue)]">❄️ Your Holibae</h2>

            <div className="flex items-center gap-4">
              {imageUrlFromCreate ? (
                <div className="w-24 h-24 rounded-xl overflow-hidden border-2 border-[var(--border)] bg-white shadow">
                  <Image
                    src={imageUrlFromCreate}
                    alt="Your Holibae"
                    width={96}
                    height={96}
                    className="object-cover w-full h-full"
                  />
                </div>
              ) : (
                <div className="w-24 h-24 rounded-xl bg-[var(--silver-light)] border-2 border-[var(--border)] text-sm text-[var(--muted)] flex items-center justify-center text-center p-2">
                  Your Holibae
                </div>
              )}

              <div className="flex-1 space-y-1">
                <div className="font-semibold text-base text-[var(--foreground)]">
                  {formFromCreate || "Mystery Holibae"}
                </div>
                <div className="text-sm text-[var(--muted)]">
                  Style: <span className="font-semibold text-[var(--base-blue)]">{style}</span>
                </div>
              </div>
            </div>

            {audioUrl ? (
              <div className="space-y-4">
                <div className="bg-[var(--silver-light)] p-4 rounded-xl">
                  <audio controls src={audioUrl} className="w-full" />
                </div>

                <div className="space-y-3">
                  <Button onClick={handleSaveSong} disabled={saving} variant="secondary">
                    {saving ? "Saving…" : "💾 Save this jingle"}
                  </Button>

                  <a
                    href={audioUrl}
                    download="holibae-song.mp3"
                    className="block w-full text-center py-2 rounded-lg bg-amber-600 font-semibold text-sm shadow-md hover:bg-amber-700 transition"
                  >
                    ⬇️ Download Song
                  </a>

                  <ShareSongButton
                    style={style}
                    prompt={prompt}
                    audioUrl={audioUrl}
                    characterImageUrl={imageUrlFromCreate || undefined}
                    characterForm={formFromCreate || undefined}
                  />
                </div>
              </div>
            ) : (
              <div className="bg-[var(--silver-light)] p-6 rounded-xl text-center">
                <p className="text-base text-[var(--muted)]">Generate a jolly anthem to save and share 🎶</p>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
