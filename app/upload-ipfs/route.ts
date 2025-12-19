import { NextRequest, NextResponse } from "next/server";
import { uploadToIPFS } from "@/app/lib/ipfs";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "Missing file" }, { status: 400 });
    }

    const upload = await uploadToIPFS(file);
    return NextResponse.json(upload);
  } catch (err) {
    console.error("❌ upload-ipfs error:", err);
    return NextResponse.json({ error: "Failed to upload to IPFS" }, { status: 500 });
  }
}
