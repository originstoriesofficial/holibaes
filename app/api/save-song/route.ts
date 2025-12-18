// app/api/save-song/route.ts
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const file = formData.get("file");
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
        { error: "PINATA_JWT not configured on server" },
        { status: 500 }
      );
    }

    const pinataForm = new FormData();
    // name is just a hint; Pinata will use it for filename
    pinataForm.append("file", file, "holibae-song.mp3");

    const timestamp = Date.now();
    const shortAddress = address.slice(0, 8).toLowerCase();

    const metadata = {
      name: `holibae-song-${shortAddress}-${timestamp}.mp3`,
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

    const pinataRes = await fetch(
      "https://api.pinata.cloud/pinning/pinFileToIPFS",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.PINATA_JWT}`,
        },
        body: pinataForm,
      }
    );

    if (!pinataRes.ok) {
      const errText = await pinataRes.text();
      console.error("❌ Pinata song error:", errText);
      return NextResponse.json(
        { error: "Pinata song upload failed", details: errText },
        { status: 502 }
      );
    }

    const pinataJson = await pinataRes.json();
    const ipfsHash = pinataJson.IpfsHash as string;

    // You can swap gateway base if you have a dedicated one
    const gatewayBase =
      process.env.PINATA_GATEWAY || "https://gateway.pinata.cloud/ipfs";
    const gatewayUrl = `${gatewayBase}/${ipfsHash}`;

    return NextResponse.json(
      {
        ipfsHash,
        gatewayUrl,
        pinSize: pinataJson.PinSize,
        timestamp: pinataJson.Timestamp,
        isDuplicate: pinataJson.isDuplicate,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("❌ save-song error:", err);
    return NextResponse.json(
      { error: "Internal error saving song to Pinata" },
      { status: 500 }
    );
  }
}
