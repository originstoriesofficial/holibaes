// app/api/merge-video/route.ts
import { NextRequest, NextResponse } from "next/server";
import { Transloadit } from "transloadit";

export const runtime = "nodejs";

const KEY = process.env.TRANSLOADIT_KEY;
const SECRET = process.env.TRANSLOADIT_SECRET;
const TEMPLATE_ID = process.env.TRANSLOADIT_TEMPLATE_ID;

// We create the client once (cold start) – safe in serverless
let transloadit: Transloadit | null = null;
if (KEY && SECRET) {
  transloadit = new Transloadit({
    authKey: KEY,
    authSecret: SECRET,
  });
} else {
  console.warn(
    "[merge-video] TRANSLOADIT_KEY or TRANSLOADIT_SECRET missing in env"
  );
}

export async function POST(req: NextRequest) {
  try {
    if (!transloadit) {
      return NextResponse.json(
        { error: "Transloadit not configured on server" },
        { status: 500 }
      );
    }

    const { audioUrl, imageUrl, address, fid } = (await req.json()) as {
      audioUrl?: string;
      imageUrl?: string;
      address?: string;
      fid?: string | null;
    };

    if (!audioUrl || !imageUrl || !address) {
      return NextResponse.json(
        { error: "Missing audioUrl, imageUrl, or wallet address" },
        { status: 400 }
      );
    }

    if (!TEMPLATE_ID) {
      return NextResponse.json(
        { error: "TRANSLOADIT_TEMPLATE_ID not configured" },
        { status: 500 }
      );
    }

    // Create assembly using the template & our two URLs
    const status = (await transloadit.createAssembly({
      params: {
        template_id: TEMPLATE_ID,
        fields: {
          imageUrl,
          audioUrl,
          walletAddress: address,
          fid: fid ?? "",
        },
      },
      // Wait until finished so we can return the final video URL
      waitForCompletion: true,
    })) as any;

    // We marked "encode_video" with result: true in the template
    const videoResult =
      status?.results?.encode_video?.[0] ??
      status?.results?.merged?.[0] ??
      status?.results?.export_video?.[0];

    const videoUrl: string | undefined =
      videoResult?.ssl_url || videoResult?.url;

    if (!videoUrl) {
      console.error("Transloadit status had no usable video result:", status);
      return NextResponse.json(
        { error: "No videoUrl found in Transloadit results" },
        { status: 502 }
      );
    }

    return NextResponse.json({ videoUrl }, { status: 200 });
  } catch (err) {
    console.error("❌ /api/merge-video error", err);
    return NextResponse.json(
      { error: "Internal error merging audio + image" },
      { status: 500 }
    );
  }
}
