// app/api/save-holibae/route.ts
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs"; // Required for fetch, FormData, etc.

function buildGatewayUrlFromCid(cid: string): string {
  const cleanCid = cid
    .trim()
    .replace(/^ipfs:\/\//, "") // ipfs://CID
    .replace(/^\/?ipfs\//, ""); // /ipfs/CID or ipfs/CID

  const gatewayBase =
    process.env.PINATA_GATEWAY || "https://gateway.pinata.cloud/ipfs";

  return `${gatewayBase}/${cleanCid}`;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      address?: string;
      fid?: string | null;
      hollyForm?: string;
      holidayKey?: string;
      color?: string;
      imageUrl?: string;  // can be Fal URL / gateway URL / ipfs://CID / CID
      ipfsHash?: string;  // optional CID
      summary?: string | null;
    };

    const {
      address,
      fid,
      hollyForm,
      holidayKey,
      color,
      imageUrl,
      ipfsHash,
      summary,
    } = body;

    if (!address) {
      return NextResponse.json(
        { error: "Missing wallet address" },
        { status: 400 }
      );
    }

    if (!process.env.PINATA_JWT) {
      return NextResponse.json(
        { error: "PINATA_JWT not configured on server" },
        { status: 500 }
      );
    }

    // ---------------- NORMALIZE IMAGE SOURCE URL ----------------
    let sourceUrl: string | null = null;

    if (imageUrl && imageUrl.trim()) {
      const raw = imageUrl.trim();

      if (raw.startsWith("http://") || raw.startsWith("https://")) {
        // already a full URL
        sourceUrl = raw;
      } else {
        // treat as CID / ipfs:// / /ipfs/CID
        sourceUrl = buildGatewayUrlFromCid(raw);
      }
    } else if (ipfsHash && ipfsHash.trim()) {
      // if caller sends only a CID
      sourceUrl = buildGatewayUrlFromCid(ipfsHash.trim());
    }

    if (!sourceUrl || !sourceUrl.startsWith("http")) {
      return NextResponse.json(
        {
          error:
            "Invalid image URL or CID. Must be a full http(s) URL or a valid CID/ipfs:// string.",
          receivedImageUrl: imageUrl,
          receivedIpfsHash: ipfsHash,
        },
        { status: 400 }
      );
    }

    // ---------------- DOWNLOAD IMAGE ----------------
    const imgRes = await fetch(sourceUrl);
    if (!imgRes.ok) {
      console.error("❌ Failed to download image:", sourceUrl, imgRes.status);
      return NextResponse.json(
        { error: "Could not download image from source URL", sourceUrl },
        { status: 502 }
      );
    }

    const arrayBuffer = await imgRes.arrayBuffer();
    const contentType = imgRes.headers.get("content-type") ?? "image/png";

    // Wrap as File for pinFileToIPFS
    const blob = new Blob([arrayBuffer], { type: contentType });
    const file = new File([blob], "holibae.png", { type: contentType });

    const formData = new FormData();
    formData.append("file", file);

    // ---------------- PINATA METADATA ----------------
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
        // Optionally also store the original source URL:
        sourceUrl,
      },
    };

    formData.append("pinataMetadata", JSON.stringify(metadata));

    // ---------------- PIN TO IPFS ----------------
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
    const ipfsHashFinal = pinataJson.IpfsHash as string;

    const gatewayUrl = buildGatewayUrlFromCid(ipfsHashFinal);

    return NextResponse.json(
      {
        ipfsHash: ipfsHashFinal,
        gatewayUrl,
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
