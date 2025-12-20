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

    // Step 1: Upload image as IMAGE
    console.log("⬆️ Uploading image...");
    const imageUpload = await cloudinary.uploader.upload(imageUrl, {
      resource_type: "image",
      public_id: `holibae-img-${Date.now()}`,
    });
    console.log("✅ Image uploaded:", imageUpload.public_id);

    // Step 2: Upload audio
    console.log("⬆️ Uploading audio...");
    const audioUpload = await cloudinary.uploader.upload(audioUrl, {
      resource_type: "video",
      public_id: `holibae-audio-${Date.now()}`,
    });
    console.log("✅ Audio uploaded:", audioUpload.public_id);

    // Step 3: Create video using create_slideshow
    console.log("🎬 Creating slideshow video...");
    
    const slideshowPublicId = `holibae-video-${Date.now()}`;
    
    const manifest = {
      w: 1080,
      h: 1080,
      fps: 1,
      du: 60,
      vars: {
        sdur: 60000,
        tdur: 0,
        slides: [
          {
            media: `i:${imageUpload.public_id}`,
          },
        ],
      },
    };

    const videoResult = await cloudinary.uploader.create_slideshow({
      public_id: slideshowPublicId,
      manifest_json: JSON.stringify(manifest) as any, // Type assertion to bypass incorrect types
    });
    console.log("✅ Slideshow created:", videoResult.public_id);

    // Step 4: Add audio to the video
    console.log("🎵 Adding audio overlay...");
    
    const finalVideo = cloudinary.url(videoResult.public_id, {
      resource_type: "video",
      transformation: [
        {
          overlay: {
            resource_type: "video",
            public_id: audioUpload.public_id,
          },
        },
        {
          flags: "layer_apply",
          audio_codec: "aac",
        },
      ],
      format: "mp4",
    });

    console.log("✅ Video ready:", finalVideo);

    return NextResponse.json({
      videoUrl: finalVideo,
      imagePublicId: imageUpload.public_id,
      audioPublicId: audioUpload.public_id,
      videoPublicId: videoResult.public_id,
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