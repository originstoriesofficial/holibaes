import { NextRequest, NextResponse } from "next/server";
import Transloadit from "transloadit";

export const runtime = "nodejs";

const client = new Transloadit({
  authKey: process.env.TRANSLOADIT_KEY!,
  authSecret: process.env.TRANSLOADIT_SECRET!,
});

export async function POST(req: NextRequest) {
  try {
    const { audioUrl, imageUrl, address, fid } = await req.json();

    if (!audioUrl || !imageUrl || !address) {
      return NextResponse.json(
        { error: "Missing audioUrl, imageUrl, or wallet address" },
        { status: 400 }
      );
    }

    console.log("🔍 Starting assembly with:", { audioUrl, imageUrl });

    const assembly = await client.createAssembly({
      params: {
        template_id: process.env.TRANSLOADIT_TEMPLATE_ID!,
        fields: {
          audioUrl,
          imageUrl,
          wallet_address: address,
          fid: fid ?? "",
        },
      },
      waitForCompletion: true,
    });

    console.log("📦 Assembly status:", assembly?.ok);
    console.log("📦 Assembly ID:", assembly?.assembly_id);
    console.log("📦 Results:", JSON.stringify(assembly?.results, null, 2));

    const video =
      assembly?.results?.encode_video?.[0]?.ssl_url ||
      assembly?.results?.encode_video?.[0]?.url;

    if (!video) {
      console.error("❌ No video in results. Full assembly:", JSON.stringify(assembly, null, 2));
      return NextResponse.json(
        {
          error: "No video returned",
          assembly_id: assembly?.assembly_id,
          assembly_url: assembly?.assembly_ssl_url,
          results: assembly?.results,
          error_details: assembly?.error,
        },
        { status: 500 }
      );
    }

    console.log("✅ Video created:", video);
    return NextResponse.json({ videoUrl: video });
  } catch (err: any) {
    console.error("❌ merge-video error:", err);
    return NextResponse.json(
      { error: err.message ?? "merge failed", details: err },
      { status: 500 }
    );
  }
}