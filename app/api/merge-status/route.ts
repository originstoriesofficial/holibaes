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

    console.log("🔍 Checking assembly status:", assemblyUrl);

    const res = await fetch(assemblyUrl);
    const data = await res.json();

    console.log("📦 Full assembly response:", JSON.stringify(data, null, 2));

    // Check if completed
    if (data.ok === "ASSEMBLY_COMPLETED") {
      const video =
        data.results?.encode_video?.[0]?.ssl_url ||
        data.results?.encode_video?.[0]?.url;

      if (video) {
        console.log("✅ Video ready:", video);
        return NextResponse.json({
          status: "ready",
          videoUrl: video,
        });
      } else {
        console.log("⚠️ Assembly completed but no video found in results");
        console.log("Available results:", Object.keys(data.results || {}));
      }
    }

    // Check if failed
    if (data.error) {
      console.error("❌ Assembly failed:", data.error, data.message);
      return NextResponse.json({
        status: "failed",
        error: data.message || "Assembly failed",
      });
    }

    // Still processing
    const progress = data.bytes_expected > 0 
      ? Math.round((data.bytes_received / data.bytes_expected) * 100)
      : 0;
    
    console.log(`⏳ Processing: ${progress}%`);

    return NextResponse.json({
      status: "processing",
      progress,
    });
  } catch (err: any) {
    console.error("❌ merge-status error:", err);
    return NextResponse.json(
      { status: "failed", error: err.message ?? "Status check failed" },
      { status: 500 }
    );
  }
}