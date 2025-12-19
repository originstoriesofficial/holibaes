import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const {
      address,
      fid,
      hollyForm,
      holidayKey,
      color,
      imageUrl,
      summary,
    } = (await req.json()) as {
      address?: string;
      fid?: string | null;
      hollyForm?: string;
      holidayKey?: string;
      color?: string;
      imageUrl?: string;
      summary?: string | null;
    };

    if (!address || !imageUrl) {
      return NextResponse.json(
        { error: "Missing wallet address or imageUrl" },
        { status: 400 }
      );
    }

    if (!process.env.PINATA_JWT) {
      return NextResponse.json(
        { error: "PINATA_JWT not configured on server" },
        { status: 500 }
      );
    }

    console.log("📸 Attempting to fetch image from:", imageUrl);

    // Fetch image from URL
    const imgRes = await fetch(imageUrl);
    if (!imgRes.ok) {
      const errText = await imgRes.text().catch(() => "[no response body]");
      console.error("❌ Could not fetch image:", imageUrl, errText);
      return NextResponse.json(
        { error: "Could not download image from source URL", sourceUrl: imageUrl },
        { status: 502 }
      );
    }

    const bytes = await imgRes.arrayBuffer();
    const mime = imgRes.headers.get("content-type") ?? "image/png";

    const file = new File([bytes], "holibae.png", { type: mime });

    const pinataForm = new FormData();
    pinataForm.append("file", file);

    const timestamp = Date.now();
    const shortAddress = address.slice(0, 8).toLowerCase();

    const metadata = {
      name: `holibae-${shortAddress}-${timestamp}.png`,
      keyvalues: {
        app: "holibaes",
        type: "image",
        walletAddress: address,
        fid: fid ?? "",
        hollyForm: hollyForm ?? "",
        holidayKey: holidayKey ?? "",
        color: color ?? "",
        summary: summary ?? "",
      },
    };

    pinataForm.append("pinataMetadata", JSON.stringify(metadata));

    const uploadRes = await fetch(
      "https://api.pinata.cloud/pinning/pinFileToIPFS",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.PINATA_JWT}`,
        },
        body: pinataForm,
      }
    );

    if (!uploadRes.ok) {
      const errorDetails = await uploadRes.text();
      console.error("❌ Pinata image upload failed:", errorDetails);
      return NextResponse.json(
        { error: "Pinata image upload failed", details: errorDetails },
        { status: 502 }
      );
    }

    const json = await uploadRes.json();
    const ipfsHash = json.IpfsHash;

    if (!ipfsHash) {
      console.error("❌ Missing IpfsHash in response:", json);
      return NextResponse.json(
        { error: "Invalid Pinata response", details: json },
        { status: 502 }
      );
    }

    const gatewayBase =
      process.env.PINATA_GATEWAY || "https://gateway.pinata.cloud/ipfs";

    const gatewayUrl = `${gatewayBase}/${ipfsHash}`;

    return NextResponse.json(
      {
        ipfsHash,
        gatewayUrl,
        pinSize: json.PinSize,
        timestamp: json.Timestamp,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("❌ save-holibae error:", err);
    return NextResponse.json(
      { error: "Internal error saving Holibae" },
      { status: 500 }
    );
  }
}
