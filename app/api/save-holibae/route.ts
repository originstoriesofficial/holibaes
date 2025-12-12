import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs"; // ensure Node runtime so fetch / FormData works well

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

    // 1) Fetch the image from Fal (or wherever the URL points to)
    const imgRes = await fetch(imageUrl);
    if (!imgRes.ok) {
      return NextResponse.json(
        { error: "Could not download image from source URL" },
        { status: 502 }
      );
    }

    const arrayBuffer = await imgRes.arrayBuffer();
    const contentType =
      imgRes.headers.get("content-type") ?? "image/png";

    // 2) Wrap into a File for Pinata
    const blob = new Blob([arrayBuffer], { type: contentType });
    const file = new File([blob], "holibae.png", { type: contentType });

    const formData = new FormData();
    formData.append("file", file);

    // 3) Attach metadata so you can search by wallet in Pinata
    formData.append(
      "pinataMetadata",
      JSON.stringify({
        name: `holibae-${address}-${Date.now()}`,
        keyvalues: {
          app: "holibaes",
          walletAddress: address,
          fid: fid ?? "",
          hollyForm: hollyForm ?? "",
          holidayKey: holidayKey ?? "",
          color: color ?? "",
          summary: summary ?? "",
        },
      })
    );

    // 4) Upload to Pinata pinFileToIPFS
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
      const errTxt = await pinataRes.text();
      console.error("Pinata error:", errTxt);
      return NextResponse.json(
        { error: "Pinata upload failed", details: errTxt },
        { status: 502 }
      );
    }

    const pinataJson = await pinataRes.json();

    // pinFileToIPFS returns { IpfsHash, PinSize, Timestamp, isDuplicate } :contentReference[oaicite:1]{index=1}
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
    console.error("save-holibae error:", err);
    return NextResponse.json(
      { error: "Internal error saving Holibae to Pinata" },
      { status: 500 }
    );
  }
}
