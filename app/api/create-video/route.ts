// app/api/create-video/route.ts
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

interface CreateVideoBody {
  audioUrl?: string;
  imageUrl?: string;
  address?: string;
  fid?: string | null;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as CreateVideoBody;
    const { audioUrl, imageUrl, address, fid } = body || {};

    // Basic input validation
    if (!audioUrl || !imageUrl || !address) {
      console.error("❌ create-video: missing fields", {
        hasAudioUrl: !!audioUrl,
        hasImageUrl: !!imageUrl,
        hasAddress: !!address,
      });
      return NextResponse.json(
        { error: "Missing audioUrl, imageUrl, or wallet address" },
        { status: 400 }
      );
    }

    // Env var check
    const apiKey = process.env.LIVEPEER_API_KEY;
    if (!apiKey) {
      console.error("❌ LIVEPEER_API_KEY is not set");
      return NextResponse.json(
        { error: "Livepeer API key not configured on server" },
        { status: 500 }
      );
    }

    // Call Livepeer transform API
    const res = await fetch("https://livepeer.studio/api/transform", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        input: [
          // ⚠️ These shapes must match Livepeer's API spec.
          // If Livepeer expects { type: "audio", url: audioUrl } etc,
          // adjust here accordingly.
          { audioUrl },
          { imageUrl },
        ],
        transform: {
          video: {
            codec: "h264",
            width: 1080,
            height: 1080,
            fps: 30,
          },
          audio: {
            codec: "aac",
            channels: 2,
          },
        },
        metadata: {
          app: "holibaes",
          walletAddress: address,
          fid: fid ?? "",
          type: "holibae-song-video",
        },
      }),
    });

    const text = await res.text();
    let data: any = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      // if Livepeer returns non-JSON (HTML error, etc)
      data = null;
    }

    if (!res.ok) {
      console.error("❌ Livepeer transform failed", {
        status: res.status,
        body: text,
      });
      return NextResponse.json(
        {
          error: "Livepeer transform failed",
          details: text || "Non-JSON error from Livepeer",
        },
        { status: 502 }
      );
    }

    const jobId = data?.id;
    if (!jobId) {
      console.error("❌ Livepeer response missing job id", data);
      return NextResponse.json(
        { error: "Livepeer response did not include a job id" },
        { status: 502 }
      );
    }

    return NextResponse.json({ jobId }, { status: 200 });
  } catch (err) {
    console.error("❌ create-video error", err);
    return NextResponse.json(
      { error: "Internal error creating video" },
      { status: 500 }
    );
  }
}
