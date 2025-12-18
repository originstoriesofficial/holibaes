// app/api/video-status/route.ts
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const jobId = req.nextUrl.searchParams.get("jobId");
  if (!jobId) {
    return NextResponse.json({ error: "Missing jobId" }, { status: 400 });
  }

  try {
    const res = await fetch(
      `https://livepeer.studio/api/transform/${jobId}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.LIVEPEER_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { error: "Status failed", details: data },
        { status: 502 }
      );
    }

    // finished?
    if (data.status?.phase === "completed") {
      const videoUrl = data.output?.video?.url; // CDN URL
      return NextResponse.json(
        {
          status: "ready",
          videoUrl,
        },
        { status: 200 }
      );
    }

    // failed
    if (data.status?.phase === "failed") {
      return NextResponse.json(
        { status: "failed" },
        { status: 200 }
      );
    }

    // still processing
    return NextResponse.json(
      { status: "processing" },
      { status: 200 }
    );
  } catch (err) {
    console.error("❌ video-status error", err);
    return NextResponse.json(
      { error: "Video status lookup failure" },
      { status: 500 }
    );
  }
}
