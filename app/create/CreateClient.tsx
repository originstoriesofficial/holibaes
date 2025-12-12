"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAccount } from "wagmi";
import { useComposeCast } from "@coinbase/onchainkit/minikit";

type Step = 1 | 2 | 3;

interface CreateClientProps {
  fid: string | null;
  originHolder: boolean;
}

const HOLIDAY_OPTIONS = [
  {
    id: "christmas",
    label: "🎄 Christmas",
    blurb: "Classic evergreen, lights, cozy winter vibes.",
  },
  {
    id: "hanukkah",
    label: "🕯 Hanukkah",
    blurb: "Blue and silver, candle glow, winter nights.",
  },
  {
    id: "posadas",
    label: "⭐ Las Posadas",
    blurb: "Lantern processions, papel picado, warm colors.",
  },
  {
    id: "lucia",
    label: "🌟 St. Lucia Day",
    blurb: "Candle crown, white gown, Nordic morning light.",
  },
  {
    id: "threeKings",
    label: "👑 Three Kings / Epiphany",
    blurb: "Regal fabrics, epiphany star, vibrant celebration.",
  },
  {
    id: "kwanzaa",
    label: "🖤❤️💚 Kwanzaa",
    blurb: "Red–green–black palette, cultural patterns.",
  },
  {
    id: "solstice",
    label: "💫 Winter Solstice / Yule",
    blurb: "Celestial motifs, stone textures, witchy energy.",
  },
  {
    id: "lunarNewYear",
    label: "🧨 Lunar New Year Preview",
    blurb: "Red and gold lanterns, dragons, fireworks.",
  },
  {
    id: "newYear",
    label: "🎉 Global New Year",
    blurb: "Metallic tones, confetti, skyline countdown.",
  },
  {
    id: "sinterklaas",
    label: "🎁 Sinterklaas",
    blurb: "Red robes, golden mitre, steamboat arrival, candy treats.",
  },
  {
    id: "basemas",
    label: "🔵 Blue Basemas (Base)",
    blurb: "Base blue, onchain glyphs, futuristic holiday.",
  },
] as const;

export default function CreateClient({ fid, originHolder }: CreateClientProps) {
  const router = useRouter();
  const { address } = useAccount();
  const { composeCast } = useComposeCast();

  const [step, setStep] = useState<Step>(1);
  const [hollyForm, setHollyForm] = useState("");
  const [holidayKey, setHolidayKey] = useState<string>("");
  const [color, setColor] = useState("");

  const [characterSummary, setCharacterSummary] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
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

    setGenerating(true);
    setSavedOnce(false);

    try {
      const res = await fetch("/api/generate-character", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hollyForm, holidayKey, color }),
      });

      const data = await res.json();
      if (!res.ok || !data.imageUrl) throw new Error(data?.error || "No image returned.");

      setImageUrl(data.imageUrl);

      const label =
        HOLIDAY_OPTIONS.find((h) => h.id === holidayKey)?.label ?? "Mystery";

      setCharacterSummary(
        `Your Holibae is a ${hollyForm} infused with ${label} energy, glowing in ${color} tones.`
      );
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setGenerating(false);
    }
  };

  const handleSaveCharacter = async () => {
    setError(null);
    if (!imageUrl || !address) {
      setError("Missing image or wallet address.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/save-holibae", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address,
          fid,
          hollyForm,
          holidayKey,
          color,
          imageUrl,
          summary: characterSummary,
        }),
      });

      if (!res.ok) throw new Error("Failed to save.");
      setSavedOnce(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleShareCharacter = () => {
    if (!imageUrl) {
      setError("Generate your Holibae first.");
      return;
    }

    const text = `I just created my Holibae in the $originstory lab ✨ create yours: https://holibaes.vercel.app`;
    composeCast({ text, embeds: [imageUrl] });
  };

  const handleGoToMusic = () => {
    const params = new URLSearchParams();
    if (fid) params.set("fid", fid);
    if (originHolder) params.set("originHolder", "1");
    if (hollyForm) params.set("hollyForm", hollyForm);
    if (imageUrl) params.set("imageUrl", imageUrl);
    router.push(`/music?${params.toString()}`);
  };

  const handleCreateAnother = () => {
    setImageUrl(null);
    setCharacterSummary(null);
    setSavedOnce(false);
    setError(null);
    setStep(1);
  };

  const mainClass =
    "min-h-screen bg-[var(--bg),#f5f2eb] text-[var(--green),#1f3b2c] font-sans px-4 py-6";

  // 💡 FORM FLOW
  if (!imageUrl) {
    return (
      <main className={mainClass}>
        <div className="w-full max-w-md mx-auto space-y-6">
          <header className="space-y-2">
            <h1 className="text-xl font-semibold">Create your Holibae</h1>
            <p className="text-sm text-[var(--green),#1f3b2c]/80">
              Pick 1) a form, 2) a holiday, and 3) a color to summon your Holibae.
            </p>
          </header>

          <div className="flex justify-center gap-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-1.5 w-6 rounded-full ${
                  step >= s ? "bg-[var(--gold),#d4af37]" : "bg-gray-300"
                }`}
              />
            ))}
          </div>

          <section className="space-y-4">
            {step === 1 && (
              <div>
                <label className="block text-sm font-medium mb-1">
                  Holibae Form (e.g. owl, doll)
                </label>
                <input
                  className="w-full border rounded-md px-3 py-2 bg-white text-sm text-black"
                  value={hollyForm}
                  onChange={(e) => setHollyForm(e.target.value)}
                  placeholder="porcelain doll, reindeer, robot"
                />
              </div>
            )}

            {step === 2 && (
              <div>
                <label className="block text-sm font-medium mb-2">
                  Choose a Holiday
                </label>
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {HOLIDAY_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setHolidayKey(opt.id)}
                      type="button"
                      className={`w-full text-left border rounded-md px-3 py-2 text-sm transition ${
                        holidayKey === opt.id
                          ? "bg-[var(--gold),#d4af37]/10 border-[var(--gold),#d4af37] text-[var(--green),#1f3b2c]"
                          : "bg-white border-gray-300 text-gray-700"
                      }`}
                    >
                      <div className="font-semibold">{opt.label}</div>
                      <div className="text-xs">{opt.blurb}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 3 && (
              <div>
                <label className="block text-sm font-medium mb-1">
                  Choose a Color
                </label>
                <input
                  className="w-full border rounded-md px-3 py-2 bg-white text-sm text-black"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  placeholder="e.g. moss green, glittery gold"
                />
              </div>
            )}

            <div className="flex justify-between">
              <button
                onClick={prevStep}
                disabled={step === 1}
                className="text-sm px-4 py-2 rounded-md bg-gray-300 text-black disabled:opacity-40"
              >
                Back
              </button>

              {step < 3 ? (
                <button
                  onClick={nextStep}
                  className="text-sm px-4 py-2 rounded-md bg-[var(--gold),#d4af37] text-black font-medium"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={handleGenerateCharacter}
                  disabled={generating}
                  className="text-sm px-4 py-2 rounded-md bg-[var(--green),#1f3b2c] text-white font-medium disabled:opacity-50"
                >
                  {generating ? "Summoning…" : "Get your Holibae"}
                </button>
              )}
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
          </section>
        </div>
      </main>
    );
  }

  // 💫 PREVIEW
  return (
    <main className={mainClass}>
      <div className="w-full max-w-md mx-auto space-y-4">
        <header className="flex justify-between items-center">
          <h1 className="text-lg font-semibold">Your Holibae</h1>
          <button
            onClick={handleCreateAnother}
            className="text-sm underline text-[var(--green),#1f3b2c]/70"
          >
            Create another
          </button>
        </header>

        <section className="space-y-4">
          <div className="w-full overflow-hidden border rounded-xl bg-white flex justify-center">
            <Image
              src={imageUrl!}
              alt="Holibae"
              width={400}
              height={400}
              className="object-contain max-h-[60vh]"
              priority
            />
          </div>

          <div className="space-y-2">
            <button
              onClick={handleSaveCharacter}
              disabled={saving}
              className="w-full py-2 rounded-lg bg-[var(--green),#1f3b2c] text-white font-medium text-sm disabled:opacity-50"
            >
              {saving
                ? "Saving…"
                : savedOnce
                ? "Holibae saved ✅"
                : "Save this Holibae"}
            </button>

            <button
              onClick={handleShareCharacter}
              className="w-full py-2 rounded-lg bg-purple-600 text-white font-medium text-sm"
            >
              Share Holibae
            </button>

            <button
              onClick={handleGoToMusic}
              className="w-full py-2 rounded-lg bg-[var(--gold),#d4af37] text-black font-medium text-sm"
            >
              Enter music studio
            </button>
          </div>

          {characterSummary && (
            <p className="text-sm bg-white border rounded-md p-3">
              {characterSummary}
            </p>
          )}

          {error && <p className="text-sm text-red-500">{error}</p>}
        </section>
      </div>
    </main>
  );
}
