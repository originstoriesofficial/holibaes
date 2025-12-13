"use client";

import React, { useMemo, useState } from "react";
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
  { id: "christmas", label: "🎄 Christmas", blurb: "Classic evergreen, lights, cozy winter vibes." },
  { id: "hanukkah", label: "🕯 Hanukkah", blurb: "Blue and silver, candle glow, winter nights." },
  { id: "posadas", label: "⭐ Las Posadas", blurb: "Lantern processions, papel picado, warm colors." },
  { id: "lucia", label: "🌟 St. Lucia Day", blurb: "Candle crown, white gown, Nordic morning light." },
  { id: "threeKings", label: "👑 Three Kings / Epiphany", blurb: "Regal fabrics, epiphany star, vibrant celebration." },
  { id: "kwanzaa", label: "🖤❤️💚 Kwanzaa", blurb: "Red–green–black palette, cultural patterns." },
  { id: "solstice", label: "💫 Winter Solstice / Yule", blurb: "Celestial motifs, stone textures, witchy energy." },
  { id: "lunarNewYear", label: "🧨 Lunar New Year Preview", blurb: "Red and gold lanterns, dragons, fireworks." },
  { id: "newYear", label: "🎉 Global New Year", blurb: "Metallic tones, confetti, skyline countdown." },
  { id: "sinterklaas", label: "🎁 Sinterklaas", blurb: "Red robes, golden mitre, steamboat arrival, candy treats." },
  { id: "basemas", label: "🔵 Blue Basemas (Base)", blurb: "Base blue, onchain glyphs, futuristic holiday." },
] as const;

export default function CreateClient({ fid, originHolder }: CreateClientProps) {
  const router = useRouter();
  const { address } = useAccount();
  const { composeCast } = useComposeCast();

  const rootUrl = useMemo(() => {
    if (typeof window !== "undefined") return window.location.origin;
    return process.env.NEXT_PUBLIC_URL ?? "https://holibaes.vercel.app";
  }, []);

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

    if (generating) return;
    setGenerating(true);
    setSavedOnce(false);

    try {
      const res = await fetch("/api/generate-character", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hollyForm, holidayKey, color }),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.imageUrl) throw new Error(data?.error || "No image returned.");

      setImageUrl(data.imageUrl);

      const label = HOLIDAY_OPTIONS.find((h) => h.id === holidayKey)?.label ?? "Mystery";
      setCharacterSummary(
        `Your Holibae is a ${hollyForm} infused with ${label} energy, glowing in ${color} tones.`
      );
    } catch (err: any) {
      setError(err?.message || "Something went wrong.");
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

    if (saving) return;
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
      setError(err?.message || "Failed to save.");
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
    const text = `I just created my Holibae in the ${labName} lab ✨ Create yours: ${rootUrl}`;
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

  // Sage theme
  const mainClass = "min-h-screen bg-[#b7c3a1] text-[#1f2a1d] font-sans px-4 py-6";

  // IMPORTANT: We use inline styles on the holiday buttons to defeat any global button CSS
  const holidayButtonStyle = (active: boolean): React.CSSProperties => ({
    backgroundColor: active ? "rgba(212,175,55,0.28)" : "rgba(255,255,255,0.92)",
    color: "#1f2a1d",
    borderColor: active ? "#d4af37" : "rgba(0,0,0,0.12)",
    WebkitTextFillColor: "#1f2a1d", // iOS Safari / webview can override text color otherwise
  });

  // FORM FLOW
  if (!imageUrl) {
    return (
      <main className={mainClass}>
        <div className="w-full max-w-md mx-auto space-y-6">
          <header className="space-y-2">
            <h1 className="text-2xl font-semibold leading-tight text-[#1f2a1d]">
              Create your Holibae
            </h1>
            <p className="text-sm leading-relaxed text-[#2f3d2b]/85">
              Pick 1) a form, 2) a holiday, and 3) a color to summon your Holibae.
            </p>
          </header>

          <div className="flex justify-center gap-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-1.5 w-6 rounded-full ${
                  step >= s ? "bg-[#d4af37]" : "bg-black/15"
                }`}
              />
            ))}
          </div>

          <section className="space-y-4">
            {step === 1 && (
              <div>
                <label className="block text-sm font-medium mb-1 text-[#1f2a1d]">
                  Holibae Form (e.g. owl, doll)
                </label>
                <input
                  className="w-full border border-black/10 rounded-md px-3 py-2 bg-white/90 text-sm text-black placeholder:text-black/40"
                  value={hollyForm}
                  onChange={(e) => setHollyForm(e.target.value)}
                  placeholder="porcelain doll, reindeer, robot"
                />
              </div>
            )}

            {step === 2 && (
              <div>
                <label className="block text-sm font-medium mb-2 text-[#1f2a1d]">
                  Choose a Holiday
                </label>

                <div className="rounded-xl border border-black/10 bg-white/55 backdrop-blur p-2">
                  <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                    {HOLIDAY_OPTIONS.map((opt) => {
                      const active = holidayKey === opt.id;
                      return (
                        <button
                          key={opt.id}
                          onClick={() => setHolidayKey(opt.id)}
                          type="button"
                          className="w-full text-left rounded-lg px-3 py-2 border transition"
                          style={holidayButtonStyle(active)}
                        >
                          <div className="font-semibold leading-snug" style={{ WebkitTextFillColor: "#1f2a1d" }}>
                            {opt.label}
                          </div>
                          <div
                            className="text-xs leading-snug"
                            style={{
                              color: "rgba(47,61,43,0.82)",
                              WebkitTextFillColor: "rgba(47,61,43,0.82)",
                            }}
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
              <div>
                <label className="block text-sm font-medium mb-1 text-[#1f2a1d]">
                  Choose a Color
                </label>
                <input
                  className="w-full border border-black/10 rounded-md px-3 py-2 bg-white/90 text-sm text-black placeholder:text-black/40"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  placeholder="e.g. moss green, glittery gold"
                />
              </div>
            )}

            <div className="flex justify-between gap-3">
              <button
                onClick={prevStep}
                disabled={step === 1}
                className="text-sm px-4 py-2 rounded-md bg-black/10 text-black disabled:opacity-40"
              >
                Back
              </button>

              {step < 3 ? (
                <button
                  onClick={nextStep}
                  className="text-sm px-4 py-2 rounded-md bg-[#d4af37] text-[#1f2a1d] font-medium active:scale-[0.99]"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={handleGenerateCharacter}
                  disabled={generating}
                  className="text-sm px-4 py-2 rounded-md bg-[#2f3d2b] text-white font-medium disabled:opacity-50 active:scale-[0.99]"
                >
                  {generating ? "Summoning…" : "Get your Holibae"}
                </button>
              )}
            </div>

            {error && (
              <p className="text-sm text-red-700 whitespace-pre-line">{error}</p>
            )}
          </section>
        </div>
      </main>
    );
  }

  // PREVIEW
  return (
    <main className={mainClass}>
      <div className="w-full max-w-md mx-auto space-y-4">
        <header className="flex justify-between items-center">
          <h1 className="text-lg font-semibold text-[#1f2a1d]">Your Holibae</h1>
          <button
            onClick={handleCreateAnother}
            className="text-sm underline text-black/70"
          >
            Create another
          </button>
        </header>

        <section className="space-y-4">
          <div className="w-full overflow-hidden border border-black/10 rounded-xl bg-white/90 flex justify-center">
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
              className="w-full py-2.5 rounded-xl bg-[#2f3d2b] text-white font-medium text-sm disabled:opacity-50 active:scale-[0.99]"
            >
              {saving ? "Saving…" : savedOnce ? "Holibae saved ✅" : "Save this Holibae"}
            </button>

            <button
              onClick={handleShareCharacter}
              className="w-full py-2.5 rounded-xl bg-[#6d28d9] text-white font-medium text-sm active:scale-[0.99]"
            >
              Share Holibae
            </button>

            <button
              onClick={handleGoToMusic}
              className="w-full py-2.5 rounded-xl bg-[#d4af37] text-[#1f2a1d] font-medium text-sm active:scale-[0.99]"
            >
              Enter music studio
            </button>
          </div>

          {characterSummary && (
            <p className="text-sm bg-white/90 border border-black/10 rounded-md p-3 text-black/90">
              {characterSummary}
            </p>
          )}

          {error && (
            <p className="text-sm text-red-700 whitespace-pre-line">{error}</p>
          )}
        </section>
      </div>
    </main>
  );
}
