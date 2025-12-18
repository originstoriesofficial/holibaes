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
    });

    const video =
      assembly?.results?.encode_video?.[0]?.ssl_url ||
      assembly?.results?.encode_video?.[0]?.url;

    if (!video) {
      return NextResponse.json(
        { error: "No video returned", assembly },
        { status: 500 }
      );
    }

    return NextResponse.json({ videoUrl: video });
  } catch (err: any) {
    console.error("❌ merge-video error:", err);
    return NextResponse.json(
      { error: err.message ?? "merge failed" },
      { status: 500 }
    );
  }
}