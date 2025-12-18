"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAccount } from "wagmi";
import Image from "next/image";
import { ShareSongButton } from "../components/ShareSongButton";
import { Button } from "../components/Button";

const styles = [
  "Lo-fi",
  "Jazz",
  "Ambient",
  "Orchestral",
  "Fantasy",
  "Cyberpunk",
  "Retro",
  "Funk",
  "Dream Pop",
  "Gospel",
  "Neo Soul",
  "Future Bass",
  "Ballad",
  "Pop",
  "Synthwave",
  "Vaporwave",
  "Acoustic",
  "Chillwave",
  "Shoegaze",
  "Trance",
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

  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fid = searchParams.get("fid");
  const formFromCreate =
    searchParams.get("hollyForm") ?? searchParams.get("animal");
  const imageUrlFromCreate = searchParams.get("imageUrl");
  const originHolder = searchParams.get("originHolder") === "1";

  const storageKey = useMemo(() => {
    if (address) return `holibae_songs_${address.toLowerCase()}`;
    if (fid) return `holibae_songs_fid_${fid}`;
    return "holibae_songs_anon";
  }, [address, fid]);

  // -------------------- GEN SONG --------------------
  const generateSong = async () => {
    if (loading) return;
    setLoading(true);
    setError(null);
    setAudioUrl(null);
    setAudioBlob(null);
    setIpfsUrl(null);
    setIpfsHash(null);
    setVideoUrl(null);

    try {
      const basePrompt =
        (prompt && prompt.trim()) || DEFAULT_PROMPT_SUGGESTION;

      let fullPrompt = `${basePrompt} in the style of ${style}.`;

      if (lyrics.trim()) {
        fullPrompt += ` Use these lyrics: ${lyrics.trim()}.`;
      } else {
        fullPrompt += ` Instrumental only, no vocals, no singing, no choir.`;
      }

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

      setAudioBlob(blob);
      setAudioUrl(url);
    } catch (e) {
      console.error(e);
      setError("Song generation failed.");
    } finally {
      setLoading(false);
    }
  };

  // -------------------- SAVE TO IPFS --------------------
  const handleSaveSong = async () => {
    if (!audioBlob) {
      setError("Generate a song first.");
      return;
    }
    if (!address) {
      setError("Wallet required.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", audioBlob, "holibae-song.mp3");
      formData.append("address", address);
      if (fid) formData.append("fid", fid);
      formData.append(
        "prompt",
        (prompt && prompt.trim()) || DEFAULT_PROMPT_SUGGESTION
      );
      formData.append("style", style);
      formData.append("lyrics", lyrics);

      const res = await fetch("/api/save-song", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        console.error("save-song failed:", await res.text());
        throw new Error("Pinning failed.");
      }

      const data = (await res.json()) as { cid: string; url: string };
      setIpfsUrl(data.url);
      setIpfsHash(data.cid);

      // save into local history
      if (typeof window !== "undefined") {
        const existingRaw = window.localStorage.getItem(storageKey);
        const existing: SavedSong[] = existingRaw
          ? JSON.parse(existingRaw)
          : [];

        const entry: SavedSong = {
          id: crypto.randomUUID(),
          createdAt: Date.now(),
          prompt: prompt || DEFAULT_PROMPT_SUGGESTION,
          lyrics,
          style,
          ipfsHash: data.cid,
        };

        const next = [entry, ...existing].slice(0, 50);
        window.localStorage.setItem(storageKey, JSON.stringify(next));
      }
    } catch (e) {
      console.error(e);
      setError("Could not save jingle.");
    } finally {
      setSaving(false);
    }
  };

  // -------------------- CREATE VIDEO --------------------
  const createAndPollVideo = async () => {
    if (!ipfsUrl) {
      setError("Save song first.");
      return;
    }
    if (!address || !imageUrlFromCreate) {
      setError("Missing wallet or Holibae image.");
      return;
    }

    setLoading(true);
    setVideoUrl(null);
    setError(null);

    try {
      const createRes = await fetch("/api/create-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          audioUrl: ipfsUrl,
          imageUrl: imageUrlFromCreate,
          address,
          fid,
        }),
      });

      const { jobId, error } = await createRes.json();
      if (!jobId) {
        setError(error || "Livepeer job failed.");
        setLoading(false);
        return;
      }

      const poll = async () => {
        const statusRes = await fetch(`/api/video-status?jobId=${jobId}`);
        const statusJson = await statusRes.json();

        if (statusJson.status === "ready") {
          setVideoUrl(statusJson.videoUrl);
          setLoading(false);
          return;
        }

        if (statusJson.status === "failed") {
          setError("Video failed.");
          setLoading(false);
          return;
        }

        setTimeout(poll, 2000);
      };

      poll();
    } catch (err) {
      console.error(err);
      setError("Video creation error.");
      setLoading(false);
    }
  };

  const effectiveDownloadUrl = audioUrl || ipfsUrl || undefined;

  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--foreground)] px-4 py-10">
      <div className="w-full max-w-5xl mx-auto space-y-10">
        {/* HEADER */}
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
              Describe your Holibae&apos;s holiday mood. We&apos;ll create a magical
              60-second seasonal anthem just for them.
            </p>
          </div>
        </header>

        {/* GRID */}
        <div className="grid md:grid-cols-[1.5fr,1fr] gap-8">
          {/* LEFT: controls */}
          <section className="card p-8 space-y-6">
            <div className="space-y-5">
              {/* Holiday Mood */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[var(--foreground)]">
                  Holiday Mood
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder={DEFAULT_PROMPT_SUGGESTION}
                  className="w-full min-h-[100px] rounded-xl border-2 border-[var(--border)] bg-white px-4 py-3 text-base"
                />
              </div>

              {/* Lyrics */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[var(--foreground)]">
                  Lyrics (Optional)
                </label>
                <textarea
                  value={lyrics}
                  onChange={(e) => setLyrics(e.target.value)}
                  placeholder="Write some lyrics (poetic or funny!)"
                  className="w-full min-h-[100px] rounded-xl border-2 border-[var(--border)] bg-white px-4 py-3 text-base"
                />
              </div>

              {/* Style */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[var(--foreground)]">
                  Choose Music Style
                </label>
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

            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}
          </section>

          {/* RIGHT: preview + actions */}
          <section className="card p-8 space-y-6">
            <h2 className="font-bold text-[var(--base-blue)]">❄️ Preview</h2>

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
                <div className="font-semibold">
                  {formFromCreate || "Mystery Holibae"}
                </div>
                <div className="text-xs text-[var(--muted)]">Style: {style}</div>
                {ipfsHash && (
                  <div className="text-[10px] break-all text-[var(--muted)]">
                    IPFS: {ipfsHash}
                  </div>
                )}
              </div>
            </div>

            {/* audio preview */}
            {effectiveDownloadUrl && (
              <div className="bg-[var(--silver-light)] p-4 rounded-xl">
                <audio controls src={effectiveDownloadUrl} className="w-full" />
              </div>
            )}

            {/* save to IPFS */}
            {!ipfsUrl && audioBlob && (
              <Button
                onClick={handleSaveSong}
                disabled={saving}
                variant="secondary"
                className="w-full"
              >
                {saving ? "Saving…" : "💾 Save to IPFS"}
              </Button>
            )}

            {/* create video */}
            {ipfsUrl && (
              <Button
                onClick={createAndPollVideo}
                disabled={loading}
                className="w-full text-lg"
              >
                {loading ? "🎥 Rendering Video…" : "📀 Create Video"}
              </Button>
            )}

            {/* final video */}
            {videoUrl && (
              <a
                href={videoUrl}
                target="_blank"
                rel="noreferrer"
                className="block w-full text-center py-3 rounded-lg bg-[#3c8aff] text-white font-semibold shadow hover:scale-105 transition"
              >
                ▶️ Watch Holibae Song Video
              </a>
            )}

            {/* share */}
            {(videoUrl || imageUrlFromCreate) && (
              <ShareSongButton
                prompt={prompt || DEFAULT_PROMPT_SUGGESTION}
                style={style}
                holibaeImageUrl={imageUrlFromCreate || undefined}
                videoUrl={videoUrl || undefined}
              />
            )}

            {error && !loading && (
              <p className="text-red-500 text-sm">{error}</p>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
