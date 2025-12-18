// app/api/merge-video/route.ts
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { audioUrl, imageUrl, address, fid } = await req.json();

    if (!audioUrl || !imageUrl) {
      return NextResponse.json(
        { error: "Missing audioUrl or imageUrl" },
        { status: 400 }
      );
    }

    if (!process.env.TRANSLOADIT_KEY || !process.env.TRANSLOADIT_MERGE_TEMPLATE) {
      return NextResponse.json(
        { error: "TRANSLOADIT_KEY or TRANSLOADIT_MERGE_TEMPLATE not configured" },
        { status: 500 }
      );
    }

    const res = await fetch("https://api2.transloadit.com/assemblies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        auth: { key: process.env.TRANSLOADIT_KEY },
        template_id: process.env.TRANSLOADIT_MERGE_TEMPLATE,
        fields: {
          image_url: imageUrl,
          audio_url: audioUrl,
          walletAddress: address ?? "",
          fid: fid ?? "",
        },
        wait: true, // block until finished, then return result
      }),
    });

    const json = await res.json();

    if (!res.ok) {
      console.error("Transloadit merge error:", json);
      return NextResponse.json(
        { error: "Transloadit merge failed", details: json },
        { status: 502 }
      );
    }

    const merged = json.results?.merged?.[0];
    const videoUrl: string | undefined = merged?.ssl_url || merged?.url;

    if (!videoUrl) {
      console.error("No video URL in Transloadit response:", json);
      return NextResponse.json(
        { error: "No video URL in merge result" },
        { status: 500 }
      );
    }

    return NextResponse.json({ videoUrl }, { status: 200 });
  } catch (err) {
    console.error("merge-video route error:", err);
    return NextResponse.json(
      { error: "Internal error merging video" },
      { status: 500 }
    );
  }
}
