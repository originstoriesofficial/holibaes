"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAccount } from "wagmi";
import { useComposeCast } from "@coinbase/onchainkit/minikit";
import { Button } from "../components/Button";

type Step = 1 | 2 | 3;

interface CreateClientProps {
  fid: string | null;
  originHolder: boolean;
}

const HOLIDAY_OPTIONS = [
  { id: "christmas", label: "🎄 Christmas", blurb: "Classic evergreen, lights, cozy winter vibes." },
  { id: "hanukkah", label: "🕯 Hanukkah", blurb: "Blue and silver, candle glow, winter nights." },
  { id: "posadas", label: "⭐ Las Posadas", blurb: "Lantern processions, papel picado, warm colors." },
  { id: "lucia", label: "🌟 St. Lucia Day", blurb: "Candle crown, white gown, Nordic morning light." },
  { id: "threeKings", label: "👑 Three Kings / Epiphany", blurb: "Regal fabrics, epiphany star, vibrant celebration." },
  { id: "kwanzaa", label: "🖤❤️💚 Kwanzaa", blurb: "Red–green–black palette, cultural patterns." },
  { id: "solstice", label: "💫 Winter Solstice / Yule", blurb: "Celestial motifs, stone textures, witchy energy." },
  { id: "lunarNewYear", label: "🧨 Lunar New Year Preview", blurb: "Red and gold lanterns, dragons, fireworks." },
  { id: "newYear", label: "🎉 Global New Year", blurb: "Metallic tones, confetti, skyline countdown." },
  { id: "sinterklaas", label: "🎁 Sinterklaas", blurb: "Dutch traditions, candy treats, cozy interiors." },
  { id: "basemas", label: "🔵 Blue Basemas (Base)", blurb: "Base blue, futuristic, monochromatic." },
] as const;

export default function CreateClient({ fid, originHolder }: CreateClientProps) {
  const router = useRouter();
  const { address } = useAccount();
  const { composeCast } = useComposeCast();

  useEffect(() => {
    document.documentElement.classList.remove("dark");
    document.documentElement.classList.add("light");
  }, []);

  const rootUrl = useMemo(() => {
    if (typeof window !== "undefined") return window.location.origin;
    return process.env.NEXT_PUBLIC_URL ?? "https://holibaes.vercel.app";
  }, []);

  const [step, setStep] = useState<Step>(1);
  const [hollyForm, setHollyForm] = useState("");
  const [holidayKey, setHolidayKey] = useState<string>("");
  const [color, setColor] = useState("");

  const [characterSummary, setCharacterSummary] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null); // Fal first, then IPFS
  const [error, setError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedOnce, setSavedOnce] = useState(false);

  const nextStep = () => {
    setError(null);
    setStep((prev) => (prev === 3 ? 3 : ((prev + 1) as Step)));
  };

  const prevStep = () => {
    setError(null);
    setStep((prev) => (prev === 1 ? 1 : ((prev - 1) as Step)));
  };

  const handleGenerateCharacter = async () => {
    setError(null);

    if (!hollyForm || !holidayKey || !color) {
      setError("Please choose a form, a holiday, and a color.");
      return;
    }

    if (generating) return;
    setGenerating(true);
    setSavedOnce(false);

    try {
      const res = await fetch("/api/generate-character", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hollyForm, holidayKey, color, address }),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.imageUrl) {
        throw new Error(data?.error || "No image returned.");
      }

      setImageUrl(data.imageUrl);

      const label =
        HOLIDAY_OPTIONS.find((h) => h.id === holidayKey)?.label ?? "Mystery";
      setCharacterSummary(
        `Your Holibae is a ${hollyForm} infused with ${label} energy, glowing in ${color} tones. Press image to download.`
      );
    } catch (err: any) {
      setError(err?.message || "Something went wrong.");
    } finally {
      setGenerating(false);
    }
  };

  /**
   * Upload Fal-generated image to IPFS via client.
   */
  const handleSaveCharacter = async (): Promise<string | null> => {
    setError(null);

    if (!imageUrl || !address) {
      setError("Missing image or wallet address.");
      return null;
    }

    if (saving) return imageUrl;
    setSaving(true);

    try {
      const imgRes = await fetch(imageUrl);
      const blob = await imgRes.blob();

      const form = new FormData();
      form.append("file", new File([blob], "holibae.png", { type: blob.type }));

      const res = await fetch("/api/upload-ipfs", {
        method: "POST",
        body: form,
      });

      const data = await res.json();
      if (!res.ok || !data?.cid) {
        throw new Error(data?.error || "Failed to upload to IPFS");
      }

      const ipfsImageUrl = `https://gateway.pinata.cloud/ipfs/${data.cid}`;
      setImageUrl(ipfsImageUrl);
      setSavedOnce(true);
      return ipfsImageUrl;
    } catch (err: any) {
      console.error("❌ Save error:", err);
      setError(err?.message || "Failed to save.");
      return null;
    } finally {
      setSaving(false);
    }
  };

  const handleShareCharacter = () => {
    setError(null);
    if (!imageUrl) {
      setError("Generate your Holibae first.");
      return;
    }

    const labName = originHolder ? "OriginStory" : "Holibae";
    const text = `I just summoned my ${labName} ✨ Create yours: ${rootUrl}`;
    composeCast({ text, embeds: [imageUrl] });
  };

  const handleGoToMusic = async () => {
    setError(null);
    let finalImageUrl = imageUrl;

    if (!finalImageUrl || !savedOnce) {
      const ipfsImageUrl = await handleSaveCharacter();
      if (!ipfsImageUrl) return;
      finalImageUrl = ipfsImageUrl;
    }

    if (!finalImageUrl.startsWith("http")) {
      setError("Image URL must start with http(s).");
      return;
    }

    const params = new URLSearchParams();
    if (fid) params.set("fid", fid);
    if (originHolder) params.set("originHolder", "1");
    if (hollyForm) params.set("hollyForm", hollyForm);
    if (finalImageUrl) params.set("imageUrl", finalImageUrl);

    router.push(`/music?${params.toString()}`);
  };

  const handleCreateAnother = () => {
    setImageUrl(null);
    setCharacterSummary(null);
    setSavedOnce(false);
    setError(null);
    setStep(1);
  };
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-[var(--bg)] text-[var(--foreground)] px-4 py-10">
      <div className="w-full max-w-lg mx-auto space-y-8">
        {!imageUrl ? (
          <>
            <header className="space-y-4">
              <div className="space-y-2">
                <h1 className="text-4xl font-bold text-[var(--base-blue)] tracking-wide">
                  Create your Holibae 🪄
                </h1>
                <div className="h-1 w-20 bg-gradient-to-r from-[var(--base-blue)] to-[var(--silver)] rounded-full"></div>
              </div>
              <div className="text-base text-[var(--muted)] space-y-2">
                <ol className="list-decimal list-inside space-y-1 pl-2">
                  <li>Choose a form (animal or doll)</li>
                  <li>Pick a holiday tradition</li>
                  <li>Select a color palette</li>
                </ol>
              </div>
            </header>

            <div className="flex justify-center gap-3">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`h-2 flex-1 max-w-[80px] rounded-full transition-all ${
                    step >= s ? "bg-[var(--base-blue)]" : "bg-[var(--silver-light)]"
                  }`}
                />
              ))}
            </div>

            <section className="card p-8 space-y-6">
              {step === 1 && (
                <div className="space-y-3">
                  <label className="block text-lg font-semibold text-[var(--base-blue)]">
                    ⬇️ Your Holibae Form
                  </label>
                  <textarea
                    rows={4}
                    className="w-full border-2 border-[var(--border)] rounded-xl px-4 py-3 bg-white text-base text-[var(--foreground)] placeholder:text-[var(--muted)] resize-none focus:outline-none focus:border-[var(--base-blue)] transition-colors"
                    value={hollyForm}
                    onChange={(e) => setHollyForm(e.target.value)}
                    placeholder="e.g., penguin, porcelain doll, reindeer, robot"
                  />
                </div>
              )}

              {step === 2 && (
                <div className="space-y-3">
                  <label className="block text-lg font-semibold text-[var(--base-blue)]">
                    Choose a Holiday
                  </label>
                  <div className="rounded-xl border-2 border-[var(--border)] bg-white p-3">
                    <div className="space-y-2 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                      {HOLIDAY_OPTIONS.map((opt) => {
                        const active = holidayKey === opt.id;
                        return (
                          <button
                            key={opt.id}
                            onClick={() => setHolidayKey(opt.id)}
                            type="button"
                            className={`w-full text-left rounded-lg px-4 py-3 border-2 text-sm transition-all ${
                              active
                                ? "bg-[var(--base-blue)] text-white border-[var(--base-blue)] shadow-md"
                                : "bg-white border-[var(--border)] hover:border-[var(--base-blue)] hover:bg-[var(--silver-light)]"
                            }`}
                          >
                            <div className="font-semibold text-base">{opt.label}</div>
                            <div
                              className={`text-xs mt-1 ${
                                active ? "text-white/90" : "text-[var(--muted)]"
                              }`}
                            >
                              {opt.blurb}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-3">
                  <label className="block text-lg font-semibold text-[var(--base-blue)]">
                    Choose a Color
                  </label>
                  <textarea
                    rows={3}
                    className="w-full border-2 border-[var(--border)] rounded-xl px-4 py-3 bg-white text-base text-[var(--foreground)] placeholder:text-[var(--muted)] resize-none focus:outline-none focus:border-[var(--base-blue)] transition-colors"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    placeholder="e.g., moss green, glittery gold, midnight blue"
                  />
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button
                  variant="secondary"
                  onClick={prevStep}
                  disabled={step === 1}
                  className="flex-1"
                >
                  ← Back
                </Button>

                {step < 3 ? (
                  <Button onClick={nextStep} className="flex-1">
                    Next →
                  </Button>
                ) : (
                  <Button
                    onClick={handleGenerateCharacter}
                    disabled={generating}
                    className="flex-1"
                  >
                    {generating ? "✨ Summoning…" : "Summon"}
                  </Button>
                )}
              </div>

              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}
            </section>
          </>
        ) : (
          <>
            <header className="flex justify-between items-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold text-[var(--base-blue)] tracking-wide">
                  ❄️ Your Holibae
                </h1>
                <div className="h-1 w-16 bg-gradient-to-r from-[var(--base-blue)] to-[var(--silver)] rounded-full"></div>
              </div>
              <button
                onClick={handleCreateAnother}
                className="text-sm font-semibold text-[var(--silver)] hover:text-[var(--base-blue)] transition-colors underline"
              >
                Create another
              </button>
            </header>

            <section className="space-y-6">
              <div className="card overflow-hidden p-4">
                <Image
                  src={imageUrl}
                  alt="Holibae"
                  width={500}
                  height={500}
                  className="object-contain w-full rounded-lg"
                  priority
                />
              </div>

              {characterSummary && (
                <div className="card p-5">
                  <p className="text-base text-[var(--foreground)] leading-relaxed">
                    {characterSummary}
                  </p>
                </div>
              )}

              <div className="space-y-3">
                <Button onClick={() => void handleSaveCharacter()} disabled={saving}>
                  {saving
                    ? "Saving…"
                    : savedOnce
                    ? "✅ Holibae saved"
                    : "💾 Save this Holibae to the Collection"}
                </Button>

                <Button onClick={handleShareCharacter} variant="secondary">
                  📤 Share Holibae
                </Button>

                <Button
                  onClick={() => void handleGoToMusic()}
                  className="bg-[var(--silver)] hover:bg-[var(--base-blue)]"
                >
                  💿 Enter music studio
                </Button>
              </div>

              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </main>
  );
}
