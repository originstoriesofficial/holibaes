import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export const runtime = "nodejs";
export const maxDuration = 60;

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
    console.log("📸 Image:", imageUrl);
    console.log("🎵 Audio:", audioUrl);

    // Upload audio first
    console.log("⬆️ Uploading audio...");
    const audioUpload = await cloudinary.uploader.upload(audioUrl, {
      resource_type: "video",
      public_id: `holibae-audio-${Date.now()}`,
    });
    console.log("✅ Audio uploaded:", audioUpload.public_id);

    // Upload image as a video (this is the key!)
    // We'll convert the static image to a video with the audio's duration
    console.log("⬆️ Converting image to video...");
    const videoUpload = await cloudinary.uploader.upload(imageUrl, {
      resource_type: "video",
      public_id: `holibae-video-${Date.now()}`,
      // These transformations happen during upload
      eager: [
        {
          // Resize and pad to 1080x1080
          width: 1080,
          height: 1080,
          crop: "pad",
          background: "black",
          // Add audio overlay
          overlay: {
            resource_type: "video",
            public_id: audioUpload.public_id,
          },
          flags: "layer_apply",
          audio_codec: "aac",
          video_codec: "h264",
          duration: 60,
          format: "mp4",
        },
      ],
      eager_async: false, // Wait for processing to complete
    });

    // Get the processed video URL
    const videoUrl = videoUpload.eager && videoUpload.eager.length > 0
      ? videoUpload.eager[0].secure_url
      : videoUpload.secure_url;

    console.log("✅ Video ready:", videoUrl);

    return NextResponse.json({
      videoUrl,
      audioPublicId: audioUpload.public_id,
      videoPublicId: videoUpload.public_id,
    });
  } catch (err: any) {
    console.error("❌ Cloudinary error:", err);
    console.error("Full error:", JSON.stringify(err, null, 2));
    return NextResponse.json(
      { error: err.message || "Failed to create video" },
      { status: 500 }
    );
  }
}