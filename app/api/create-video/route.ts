// app/api/create-video/route.ts
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { audioUrl, imageUrl, address, fid } = await req.json();

    if (!audioUrl || !imageUrl || !address) {
      return NextResponse.json(
        { error: "Missing audioUrl, imageUrl, or wallet address" },
        { status: 400 }
      );
    }

    const res = await fetch(
      "https://livepeer.studio/api/transform",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.LIVEPEER_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          input: [
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
      }
    );

    if (!res.ok) {
      const detailed = await res.text();
      return NextResponse.json(
        { error: "Livepeer transform failed", details: detailed },
        { status: 502 }
      );
    }

    const data = await res.json();

    return NextResponse.json(
      {
        jobId: data.id,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("❌ create-video error", err);
    return NextResponse.json(
      { error: "Internal error creating video" },
      { status: 500 }
    );
  }
}
