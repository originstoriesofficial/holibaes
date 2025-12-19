// /app/api/create-video/route.ts
import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export const runtime = "nodejs";
export const maxDuration = 60; // Allow up to 60 seconds

export async function POST(req: NextRequest) {
  try {
    const { imageUrl, audioUrl, walletAddress } = await req.json();

    if (!imageUrl || !audioUrl) {
      return NextResponse.json(
        { error: "Missing imageUrl or audioUrl" },
        { status: 400 }
      );
    }

    console.log("🎬 Creating video with Cloudinary...");

    // Upload image
    const imageUpload = await cloudinary.uploader.upload(imageUrl, {
      resource_type: "image",
      folder: "holibaes/images",
    });

    // Upload audio
    const audioUpload = await cloudinary.uploader.upload(audioUrl, {
      resource_type: "video",
      folder: "holibaes/audio",
    });

    // Create video using explicit API (this actually processes it)
    const videoResult = await cloudinary.uploader.explicit(imageUpload.public_id, {
      resource_type: "video",
      type: "upload",
      eager: [
        {
          width: 1080,
          height: 1080,
          crop: "pad",
          background: "black",
          duration: 60,
          overlay: { resource_type: "video", public_id: audioUpload.public_id },
          flags: "layer_apply",
          format: "mp4",
        },
      ],
      eager_async: false, // Wait for processing to complete
    });

    // Get the processed video URL
    const videoUrl = videoResult.eager[0].secure_url;

    console.log("✅ Video ready:", videoUrl);

    return NextResponse.json({
      videoUrl,
      imagePublicId: imageUpload.public_id,
      audioPublicId: audioUpload.public_id,
    });
  } catch (err: any) {
    console.error("❌ Cloudinary error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to create video" },
      { status: 500 }
    );
  }
}