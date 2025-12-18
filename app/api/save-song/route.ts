import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs"; // required since we stream file buffers

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.PINATA_JWT;
    if (!apiKey) {
      console.error("❌ Missing PINATA_JWT");
      return NextResponse.json({ error: "Server misconfig" }, { status: 500 });
    }

    const formData = await req.formData();

    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "Missing audio file" }, { status: 400 });
    }

    // metadata (optional but good)
    const metadata = {
      name: "holibae-song",
      keyvalues: {
        wallet: formData.get("address") || "",
        fid: formData.get("fid") || "",
        style: formData.get("style") || "",
        prompt: formData.get("prompt") || "",
      },
    };

    const pinata = await fetch(
      "https://api.pinata.cloud/pinning/pinFileToIPFS",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
        body: (() => {
          const fd = new FormData();
          fd.append("file", file, "song.mp3");
          fd.append("pinataMetadata", JSON.stringify(metadata));
          return fd;
        })(),
      }
    );

    const pinataRes = await pinata.json();

    if (!pinata.ok) {
      console.error("❌ Pinata failed:", pinataRes);
      return NextResponse.json(
        { error: "Pinning failed", details: pinataRes },
        { status: 500 }
      );
    }

    const cid = pinataRes.IpfsHash;

    // gateway URL
    const url = `https://gateway.pinata.cloud/ipfs/${cid}`;

    return NextResponse.json({ cid, url });
  } catch (err) {
    console.error("❌ save-song error:", err);
    return NextResponse.json({ error: "Server error saving song" }, { status: 500 });
  }
}
