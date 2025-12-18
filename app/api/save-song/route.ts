// app/api/save-song/route.ts
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const file = formData.get("file") as File | null;
    const address = formData.get("address") as string | null;
    const fid = formData.get("fid") as string | null;
    const prompt = formData.get("prompt") as string | null;
    const style = formData.get("style") as string | null;
    const lyrics = formData.get("lyrics") as string | null;

    if (!(file instanceof Blob) || !address) {
      return NextResponse.json(
        { error: "Missing audio file or wallet address" },
        { status: 400 }
      );
    }

    if (!process.env.PINATA_JWT) {
      return NextResponse.json(
        { error: "PINATA_JWT not configured" },
        { status: 500 }
      );
    }

    const pinataForm = new FormData();
    pinataForm.append("file", file, "holibae-song.mp3");

    const timestamp = Date.now();
    const metadata = {
      name: `holibae-song-${address.slice(0, 8)}-${timestamp}.mp3`,
      keyvalues: {
        app: "holibaes",
        type: "song",
        walletAddress: address,
        fid: fid ?? "",
        prompt: prompt ?? "",
        style: style ?? "",
        lyrics: lyrics ?? "",
      },
    };

    pinataForm.append("pinataMetadata", JSON.stringify(metadata));

    const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PINATA_JWT}`,
      },
      body: pinataForm,
    });

    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json(
        { error: "Pinata upload failed", details: errText },
        { status: 502 }
      );
    }

    const json = await res.json();
    const ipfsHash = json.IpfsHash;

    const gatewayBase =
      process.env.PINATA_GATEWAY || "https://gateway.pinata.cloud/ipfs";
    const gatewayUrl = `${gatewayBase}/${ipfsHash}`;

    return NextResponse.json(
      { ipfsHash, gatewayUrl, timestamp },
      { status: 200 }
    );
  } catch (err) {
    return NextResponse.json(
      { error: "Internal error saving song" },
      { status: 500 }
    );
  }
}
