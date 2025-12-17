"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAccount, usePublicClient, useWriteContract } from "wagmi";
import {
  MONKERIA_CONTRACT_ADDRESS,
  monkeriaAbi,
} from "@/constants/monkeriaContract";

type Step = 1 | 2 | 3;

interface CreateClientProps {
  fid: string | null;
  originHolder: boolean;
}

export default function CreateClient({ fid, originHolder }: CreateClientProps) {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const { writeContractAsync } = useWriteContract();

  const [step, setStep] = useState<Step>(1);

  // Holibae inputs
  const [animal, setAnimal] = useState("");
  const [holiday, setHoliday] = useState("");
  const [color, setColor] = useState("");

  const [characterSummary, setCharacterSummary] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [minting, setMinting] = useState(false);
  const [hasMinted, setHasMinted] = useState(false);

  const nextStep = () => {
    setError(null);
    setStep((prev) => Math.min(3, prev + 1) as Step);
  };

  const prevStep = () => {
    setError(null);
    setStep((prev) => Math.max(1, prev - 1) as Step);
  };

  // 🔥 Generate Holibae via /api/generate-character
  const handleGenerateCharacter = async () => {
    setError(null);

    if (!animal || !holiday || !color) {
      setError("Please complete all 3 steps (animal, holiday, color).");
      return;
    }

    setGenerating(true);
    setHasMinted(false);
    setCharacterSummary(null);
    setImageUrl(null);

    try {
      const res = await fetch("/api/generate-character", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hollyForm: animal,
          holidayKey: holiday,
          color,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Failed to generate Holibae.");
      }

      const data = await res.json();
      if (!data.imageUrl) throw new Error("No image URL returned.");

      setImageUrl(data.imageUrl);

      setCharacterSummary(
        `Your Holibae is a ${animal} styled for ${holiday}, with a color palette based on "${color}".`
      );
    } catch (err: any) {
      console.error("Generation error:", err);
      setError(err?.message || "Something went wrong generating your Holibae.");
    } finally {
      setGenerating(false);
    }
  };

  // 🔥 Mint Holibae NFT (this is where payment actually happens)
  const handleMintCharacter = async () => {
    setError(null);

    if (!imageUrl) {
      setError("Generate your Holibae first.");
      return;
    }

    if (!isConnected || !address) {
      setError("Wallet not connected. Open in the Base app and try again.");
      return;
    }

    if (!publicClient) {
      setError("Public client not ready.");
      return;
    }

    setMinting(true);

    try {
      // Contract decides 0.001 vs 0.002 based on Origin/Mantle holding
      const mintPriceWei = (await publicClient.readContract({
        address: MONKERIA_CONTRACT_ADDRESS,
        abi: monkeriaAbi,
        functionName: "getMintPrice",
        args: [address],
      })) as bigint;

      const txHash = await writeContractAsync({
        address: MONKERIA_CONTRACT_ADDRESS,
        abi: monkeriaAbi,
        functionName: "mint",
        args: [imageUrl, BigInt(1)],
        value: mintPriceWei,
        account: address,
      });

      console.log("Mint tx:", txHash);
      setHasMinted(true);
    } catch (err: any) {
      console.error("Mint error:", err);
      setError(err?.message || "Mint failed. Check your Base balance.");
      setHasMinted(false);
    } finally {
      setMinting(false);
    }
  };

  // 🎵 After mint → enter studio
  const handleGoToMusic = () => {
    if (!hasMinted) {
      setError("Please mint your Holibae first.");
      return;
    }

    const params = new URLSearchParams();
    if (fid) params.set("fid", fid);
    if (originHolder) params.set("originHolder", "1");
    params.set("animal", animal);
    if (imageUrl) params.set("imageUrl", imageUrl);
    params.set("hasHolibae", "1");

    router.push(`/music?${params.toString()}`);
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-zinc-950 px-4">
      <div className="w-full max-w-md space-y-4 text-center pb-6">
        <h1 className="text-2xl font-bold mb-1">Create your Holibae</h1>
        <p className="text-sm text-zinc-300">
          Choose an animal, a holiday, and a color. We&apos;ll generate your
          plush 3D Holibae and mint it on Base to unlock the music studio.
        </p>

        {/* Access / pricing info at top */}
        <div className="mt-2 p-2 rounded-md bg-zinc-900 border border-zinc-700 text-xs text-left">
          {originHolder ? (
            <>
              <p className="font-semibold text-emerald-400">
                Access: OriginStory holder detected ✅
              </p>
              <p className="text-zinc-300 mt-1">
                Your Holibae mints at a discounted rate (0.001 ETH in this
                testnet contract).
              </p>
            </>
          ) : (
            <>
              <p className="font-semibold text-amber-400">
                Access: No OriginStory token detected
              </p>
              <p className="text-zinc-300 mt-1">
                Minting a Holibae costs 0.002 ETH (testnet). You need a minted
                Holibae to enter the music studio.
              </p>
            </>
          )}
        </div>

        {/* Step indicator */}
        <div className="flex justify-center gap-2 mt-3">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-2 w-8 rounded-full ${
                step >= s ? "bg-amber-500" : "bg-zinc-700"
              }`}
            />
          ))}
        </div>

        {/* STEP 1 — ANIMAL */}
        {step === 1 && (
          <div className="space-y-3 mt-2">
            <label className="block text-left text-sm">
              1. What animal is your Holibae?
            </label>
            <input
              className="w-full px-3 py-2 rounded-md bg-zinc-900 border border-zinc-700 text-sm"
              placeholder="e.g. owl, fox, deer, bear"
              value={animal}
              onChange={(e) => setAnimal(e.target.value)}
            />
          </div>
        )}

        {/* STEP 2 — HOLIDAY */}
        {step === 2 && (
          <div className="space-y-3 mt-2">
            <label className="block text-left text-sm">
              2. Choose their holiday origin
            </label>
            <select
              className="w-full px-3 py-2 rounded-md bg-zinc-900 border border-zinc-700 text-sm"
              value={holiday}
              onChange={(e) => setHoliday(e.target.value)}
            >
              <option value="">Select a holiday</option>
              <option value="christmas">🎄 Christmas</option>
              <option value="hanukkah">🕯 Hanukkah</option>
              <option value="posadas">⭐ Las Posadas</option>
              <option value="lucia">🌟 St. Lucia Day</option>
              <option value="threeKings">👑 Three Kings</option>
              <option value="kwanzaa">🖤❤️💚 Kwanzaa</option>
              <option value="solstice">💫 Winter Solstice</option>
              <option value="lunarNewYear">🧨 Lunar New Year</option>
              <option value="newYear">🎉 Global New Year</option>
              <option value="festivus">🧩 Festivus</option>
              <option value="basemas">🔵 Basemas</option>
            </select>
          </div>
        )}

        {/* STEP 3 — COLOR */}
        {step === 3 && (
          <div className="space-y-3 mt-2">
            <label className="block text-left text-sm">
              3. What is the dominant color palette?
            </label>
            <input
              className="w-full px-3 py-2 rounded-md bg-zinc-900 border border-zinc-700 text-sm"
              placeholder="e.g. icy teal, ember gold, lunar red"
              value={color}
              onChange={(e) => setColor(e.target.value)}
            />
          </div>
        )}

        {/* NAV BUTTONS */}
        <div className="flex justify-between mt-4">
          <button
            onClick={prevStep}
            disabled={step === 1}
            className="px-3 py-2 text-sm rounded-md border border-zinc-600 disabled:opacity-40"
          >
            Back
          </button>

          {step < 3 ? (
            <button
              onClick={nextStep}
              className="px-3 py-2 text-sm rounded-md bg-amber-600 font-semibold"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleGenerateCharacter}
              disabled={generating}
              className="px-3 py-2 text-sm rounded-md bg-amber-600 font-semibold disabled:opacity-60"
            >
              {generating ? "Summoning your Holibae…" : "Generate Holibae"}
            </button>
          )}
        </div>

        {/* MINT BUTTON ABOVE PREVIEW */}
        {imageUrl && (
          <div className="mt-5 space-y-3">
            <button
              onClick={handleMintCharacter}
              disabled={minting || hasMinted}
              className="w-full py-2 rounded-lg bg-amber-600 font-semibold text-sm shadow-md disabled:opacity-60"
            >
              {minting
                ? "Minting your Holibae…"
                : hasMinted
                ? "Holibae Minted ✅"
                : originHolder
                ? "Mint Holibae (Origin holder pricing)"
                : "Mint Holibae (0.002 ETH)"}
            </button>

            <button
              onClick={handleGoToMusic}
              disabled={!hasMinted}
              className="w-full py-2 rounded-lg bg-emerald-600 font-semibold text-sm shadow-md disabled:opacity-40"
            >
              Enter Music Studio
            </button>

            {/* PREVIEW IMAGE */}
            <div className="relative w-full aspect-square rounded-xl overflow-hidden border border-zinc-700">
              <Image
                src={imageUrl}
                alt="Generated Holibae"
                fill
                className="object-cover"
              />
            </div>
          </div>
        )}

        {/* Summary */}
        {characterSummary && (
          <div className="mt-4 p-3 rounded-md bg-zinc-900 border border-zinc-700 text-left text-sm whitespace-pre-line">
            {characterSummary}
          </div>
        )}

        {/* Errors */}
        {error && (
          <p className="mt-3 text-sm text-red-400 whitespace-pre-line">
            {error}
          </p>
        )}
      </div>
    </main>
  );
}
