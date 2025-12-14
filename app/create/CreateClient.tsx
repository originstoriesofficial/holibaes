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
  { id: "sinterklaas", label: "🎁 Sinterklaas", blurb: "Red robes, golden mitre, steamboat arrival, candy treats." },
  { id: "basemas", label: "🔵 Blue Basemas (Base)", blurb: "Base blue, onchain glyphs, futuristic holiday." },
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
        body: JSON.stringify({ hollyForm, holidayKey, color, address }),
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

  return (
    <main className="min-h-screen bg-[var(--bg,#f7e8d0)] text-[var(--foreground)] px-4 py-10 font-sans">
      <div className="w-full max-w-md mx-auto space-y-6">
        {!imageUrl ? (
          <>
            <header className="space-y-3">
              <h1 className="text-2xl font-bold text-[#ce19e6] font-[Oswald] tracking-wide">
                Create your Holibae
              </h1>
              <div className="text-sm text-muted space-y-1 text-left">
                <p>Pick:</p>
                <p>1) a form (animal or doll type)</p>
                <p>2) a holiday</p>
                <p>3) a color to summon your Holibae</p>
              </div>
            </header>
  
            <div className="flex justify-center gap-2">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`h-1.5 w-6 rounded-full ${
                    step >= s ? "bg-[var(--gold)]" : "bg-[var(--muted)]/30"
                  }`}
                />
              ))}
            </div>
  
            <section className="space-y-4">
  {step === 1 && (
    <div>
      <label className="block text-sm font-semibold text-[#ce19e6] mb-1">
        Write Your Holibae Form
      </label>
      <textarea
        rows={4} // ⬅️ You can increase this for more vertical space
        className="w-full border border-[var(--border)] rounded-md px-3 py-2 bg-white/90 text-sm text-black placeholder:text-black/40 resize-none"
        value={hollyForm}
        onChange={(e) => setHollyForm(e.target.value)}
        placeholder="ex: penguin, porcelain doll, reindeer, robot"
      />
    </div>
  )}
  
              {step === 2 && (
                <div>
                  <label className="block text-sm font-semibold text-[#ce19e6] mb-2">
                  Choose a Holiday
                  </label>
                  <div className="rounded-xl border border-[var(--border)] bg-white/60 backdrop-blur p-2">
                    <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                      {HOLIDAY_OPTIONS.map((opt) => {
                        const active = holidayKey === opt.id;
                        return (
                          <button
                            key={opt.id}
                            onClick={() => setHolidayKey(opt.id)}
                            type="button"
                            className={`w-full text-left rounded-lg px-3 py-2 border text-sm transition ${
                              active
                                ? "bg-[var(--gold)]/20 border-[var(--gold)]"
                                : "bg-white border-[var(--border)]"
                            }`}
                          >
                            <div className="font-semibold">{opt.label}</div>
                            <div className="text-xs text-muted">{opt.blurb}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
  
  {step === 3 && (
  <div>
    <label className="block text-sm font-semibold text-[#ce19e6] mb-1">
      Step Three: Choose a Color
    </label>
    <textarea
      rows={3} // ⬅️ Gives the field more height for clarity
      className="w-full border border-[var(--border)] rounded-md px-3 py-2 bg-white/90 text-sm text-black placeholder:text-black/40 resize-none"
      value={color}
      onChange={(e) => setColor(e.target.value)}
      placeholder="e.g. moss green, glittery gold"
    />
  </div>
)}

  
              <div className="flex justify-between gap-3">
                <Button variant="secondary" onClick={prevStep} disabled={step === 1}>
                  Back
                </Button>
  
                {step < 3 ? (
                  <Button onClick={nextStep}>Next</Button>
                ) : (
                  <Button onClick={handleGenerateCharacter} disabled={generating}>
                    {generating ? "Summoning…" : "Get your Holibae"}
                  </Button>
                )}
              </div>
  
              {error && (
                <p className="text-sm text-red-700 whitespace-pre-line">{error}</p>
              )}
            </section>
          </>
        ) : (
          <>
            <header className="flex justify-between items-center">
              <h1 className="text-lg font-bold text-[#ce19e6] font-[Oswald] tracking-wide">
                ❄️ Your Holibae ❄️
              </h1>
              <button onClick={handleCreateAnother} className="text-sm underline text-muted">
                Create another
              </button>
            </header>
  
            <section className="space-y-4">
              <div className="w-full overflow-hidden border border-[var(--border)] rounded-xl bg-white/90 flex justify-center">
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
                <Button onClick={handleSaveCharacter} disabled={saving}>
                  {saving ? "Saving…" : savedOnce ? "Holibae saved ✅" : "Save this Holibae"}
                </Button>
  
                <Button onClick={handleShareCharacter} className="bg-[#6d28d9] text-white">
                  Share Holibae
                </Button>
  
                {/* ✅ FIX: Use white text for readability */}
                <Button onClick={handleGoToMusic} className="bg-[#ce19e6] text-white">
                  Enter music studio
                </Button>
              </div>
  
              {characterSummary && (
                <p className="text-sm bg-white/90 border border-[var(--border)] rounded-md p-3 text-black/90">
                  {characterSummary}
                </p>
              )}
  
              {error && (
                <p className="text-sm text-red-700 whitespace-pre-line">{error}</p>
              )}
            </section>
          </>
        )}
      </div>
    </main>
  );
  }