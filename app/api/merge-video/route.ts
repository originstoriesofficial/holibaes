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

    // 🔍 Log the actual URLs being sent
    console.log("📸 Image URL:", imageUrl);
    console.log("🎵 Audio URL:", audioUrl);

    // Validate URLs start with http/https
    if (!audioUrl.startsWith("http://") && !audioUrl.startsWith("https://")) {
      return NextResponse.json(
        { error: "Invalid audio URL - must start with http:// or https://" },
        { status: 400 }
      );
    }

    if (!imageUrl.startsWith("http://") && !imageUrl.startsWith("https://")) {
      return NextResponse.json(
        { error: "Invalid image URL - must start with http:// or https://" },
        { status: 400 }
      );
    }

    // Test if URLs are actually accessible
    try {
      const imageTest = await fetch(imageUrl, { method: 'HEAD' });
      console.log("✅ Image accessible:", imageTest.ok, imageTest.status);
      if (!imageTest.ok) {
        return NextResponse.json(
          { error: `Image URL not accessible: ${imageTest.status}` },
          { status: 400 }
        );
      }
    } catch (e) {
      console.error("❌ Image NOT accessible:", e);
      return NextResponse.json(
        { error: "Image URL cannot be fetched" },
        { status: 400 }
      );
    }

    try {
      const audioTest = await fetch(audioUrl, { method: 'HEAD' });
      console.log("✅ Audio accessible:", audioTest.ok, audioTest.status);
      if (!audioTest.ok) {
        return NextResponse.json(
          { error: `Audio URL not accessible: ${audioTest.status}` },
          { status: 400 }
        );
      }
    } catch (e) {
      console.error("❌ Audio NOT accessible:", e);
      return NextResponse.json(
        { error: "Audio URL cannot be fetched" },
        { status: 400 }
      );
    }

    console.log("🔍 Creating Transloadit assembly...");

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
      waitForCompletion: false,
    });

    console.log("📦 Assembly created:", assembly?.assembly_id);
    console.log("📦 Assembly URL:", assembly?.assembly_ssl_url);

    return NextResponse.json({
      assemblyUrl: assembly?.assembly_ssl_url,
      assemblyId: assembly?.assembly_id,
    });
  } catch (err: any) {
    console.error("❌ merge-video error:", err);
    return NextResponse.json(
      {
        error: err.message ?? "merge failed",
        assemblyUrl: err.response?.assembly_ssl_url,
      },
      { status: 500 }
    );
  }
}