// app/api/compose/route.ts
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const {
      prompt,
      music_length_ms = 60000,
      output_format = "mp3_44100_128",
    } = await req.json();

    if (!prompt) {
      return NextResponse.json(
        { error: "Missing prompt" },
        { status: 400 }
      );
    }

    const apiKey = process.env.MUSIC_API_KEY;
    if (!apiKey) {
      console.error("❌ Missing MUSIC_API_KEY env var");
      return NextResponse.json(
        { error: "Server key missing" },
        { status: 500 }
      );
    }

    const response = await fetch(
      "https://api.elevenlabs.io/v1/music/generate",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "audio/mpeg",            // <-- required for binary mp3 return
          "xi-api-key": apiKey,
        },
        body: JSON.stringify({
          prompt,
          music_length_ms,
          output_format,
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error("❌ ElevenLabs generation failure:", errText);
      return NextResponse.json(
        { error: "Music generation failed", details: errText },
        { status: 500 }
      );
    }

    const audioBuffer = await response.arrayBuffer();

    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Disposition": 'inline; filename="holibae-anthem.mp3"',
        "Cache-Control": "max-age=0, no-cache, no-store",
      },
    });
  } catch (err) {
    console.error("❌ /api/compose exception", err);
    return NextResponse.json(
      { error: "Internal compose failure" },
      { status: 500 }
    );
  }
}
