import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { prompt, music_length_ms } = await req.json();

    if (!prompt) {
      return NextResponse.json(
        { error: "Missing prompt" },
        { status: 400 }
      );
    }

    const falRes = await fetch(
      "https://api.fal.ai/music/generate",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.FAL_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          duration_ms: music_length_ms ?? 60000,
          format: "mp3",
        }),
      }
    );

    if (!falRes.ok) {
      const txt = await falRes.text();
      console.error("compose failed:", txt);
      return NextResponse.json(
        { error: "music failed", details: txt },
        { status: 502 }
      );
    }

    // stream / buffer MP3
    const arrayBuffer = await falRes.arrayBuffer();
    const uint8 = new Uint8Array(arrayBuffer);

    return new NextResponse(uint8, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
      },
    });
  } catch (err) {
    console.error("compose error:", err);
    return NextResponse.json(
      { error: "server compose failed" },
      { status: 500 }
    );
  }
}
