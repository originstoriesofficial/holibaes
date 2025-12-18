// app/api/merge-video/route.ts
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

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

    const KEY = process.env.TRANSLOADIT_KEY;
    const SECRET = process.env.TRANSLOADIT_SECRET;
    const TEMPLATE_ID = process.env.TRANSLOADIT_TEMPLATE_ID;

    if (!KEY || !SECRET || !TEMPLATE_ID) {
      console.error("Missing TRANSLOADIT_* env vars");
      return NextResponse.json(
        { error: "Server misconfigured (Transloadit env vars missing)" },
        { status: 500 }
      );
    }

    // params object must match what your template expects
    const params = {
      auth: {
        key: KEY,
        // 10 min lifetime
        expires: Math.floor(Date.now() / 1000) + 10 * 60,
      },
      template_id: TEMPLATE_ID,
      fields: {
        image_url: imageUrl,
        audio_url: audioUrl,
        walletAddress: address,
        fid: fid ?? "",
      },
    };

    const paramsJson = JSON.stringify(params);

    // HMAC-SHA1 signature
    const signature = crypto
      .createHmac("sha1", SECRET)
      .update(paramsJson)
      .digest("hex");

    const body = new URLSearchParams();
    body.set("params", paramsJson);
    body.set("signature", signature);

    const tlRes = await fetch("https://api2.transloadit.com/assemblies", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    });

    const data = await tlRes.json();

    if (!tlRes.ok) {
      console.error("Transloadit assembly error:", data);
      return NextResponse.json(
        { error: "Transloadit assembly failed", details: data },
        { status: 502 }
      );
    }

    const assemblyId = data.assembly_id as string;
    const assemblyUrl = data.assembly_url as string;

    return NextResponse.json(
      { assemblyId, assemblyUrl },
      { status: 200 }
    );
  } catch (err) {
    console.error("❌ merge-video route error:", err);
    return NextResponse.json(
      { error: "Internal error creating video" },
      { status: 500 }
    );
  }
}
