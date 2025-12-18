// app/api/merge-status/route.ts
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const assemblyUrl = req.nextUrl.searchParams.get("assemblyUrl");
    if (!assemblyUrl) {
      return NextResponse.json(
        { error: "Missing assemblyUrl" },
        { status: 400 }
      );
    }

    const res = await fetch(assemblyUrl);
    const data = await res.json();

    if (!res.ok) {
      console.error("Transloadit status error:", data);
      return NextResponse.json(
        { error: "Status lookup failed", details: data },
        { status: 502 }
      );
    }

    const ok = data.ok as string | undefined;

    if (ok === "ASSEMBLY_COMPLETED") {
      const videoResult =
        data.results?.merged?.[0] ??
        data.results?.["merged"]?.[0] ??
        null;

      const videoUrl =
        videoResult?.ssl_url || videoResult?.url || null;

      return NextResponse.json(
        {
          status: "ready",
          videoUrl,
        },
        { status: 200 }
      );
    }

    if (ok === "ASSEMBLY_EXECUTING" || ok === "ASSEMBLY_UPLOADING") {
      return NextResponse.json({ status: "processing" }, { status: 200 });
    }

    return NextResponse.json({ status: "failed" }, { status: 200 });
  } catch (err) {
    console.error("❌ merge-status error:", err);
    return NextResponse.json(
      { error: "Video status lookup failure" },
      { status: 500 }
    );
  }
}
