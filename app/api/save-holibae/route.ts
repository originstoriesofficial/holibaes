import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs"; // Required for fetch, FormData, etc.

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

    // 1. Download the image from URL
    const imgRes = await fetch(imageUrl);
    if (!imgRes.ok) {
      return NextResponse.json(
        { error: "Could not download image from source URL" },
        { status: 502 }
      );
    }

    const arrayBuffer = await imgRes.arrayBuffer();
    const contentType = imgRes.headers.get("content-type") ?? "image/png";

    // 2. Wrap image as a File object
    const blob = new Blob([arrayBuffer], { type: contentType });
    const file = new File([blob], "holibae.png", { type: contentType });

    const formData = new FormData();
    formData.append("file", file);

    // 3. Construct Pinata metadata
    const timestamp = Date.now();
    const shortAddress = address.slice(0, 8).toLowerCase();

    const metadata = {
      name: `holibae-${shortAddress}-${timestamp}.png`,
      keyvalues: {
        app: "holibaes",
        walletAddress: address,
        fid: fid ?? "",
        hollyForm: hollyForm ?? "",
        holidayKey: holidayKey ?? "",
        color: color ?? "",
        summary: summary ?? "",
      },
    };

    formData.append("pinataMetadata", JSON.stringify(metadata));

    // 4. Upload to Pinata (pinFileToIPFS)
    const pinataRes = await fetch(
      "https://api.pinata.cloud/pinning/pinFileToIPFS",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.PINATA_JWT}`,
        },
        body: formData,
      }
    );

    if (!pinataRes.ok) {
      const errText = await pinataRes.text();
      console.error("❌ Pinata error:", errText);
      return NextResponse.json(
        { error: "Pinata upload failed", details: errText },
        { status: 502 }
      );
    }

    const pinataJson = await pinataRes.json();

    return NextResponse.json(
      {
        ipfsHash: pinataJson.IpfsHash,
        pinSize: pinataJson.PinSize,
        timestamp: pinataJson.Timestamp,
        isDuplicate: pinataJson.isDuplicate,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("❌ save-holibae error:", err);
    return NextResponse.json(
      { error: "Internal error saving Holibae to Pinata" },
      { status: 500 }
    );
  }
}
