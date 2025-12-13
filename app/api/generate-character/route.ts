import { NextResponse } from "next/server";
import { fal } from "@fal-ai/client";

fal.config({
  credentials: process.env.FAL_KEY!,
});

// Single plush style used everywhere
const STYLE_PLUSH = `
plush-doll proportions, soft rounded silhouette, velvety texture,
cute expressive eyes, collectible figurine energy,
full-body, standing on a small surface, centered composition,
gentle diffusion glow, premium toy photography lighting,
hyper-detailed 3D render,
`;

// Holiday → description map
// ⚠️ IMPORTANT: no explicit color words here.
// Let these describe vibe / setting, NOT palette.
const HOLLY_MAP = {
  christmas: {
    design: [
      "cozy winter celebration scene",
      "classic storybook holiday setting",
      "snowy village and festive decorations",
      "warm fireplace and holiday gathering mood",
    ],
    outfit: [
      "a winter coat with festive details",
      "a cozy holiday sweater and boots",
      "a vintage toyshop-inspired outfit",
      "a scarf and hat with subtle holiday patterns",
    ],
  },
  hanukkah: {
    design: [
      "candlelit festival atmosphere",
      "Hanukkah storybook setting",
      "peaceful winter evening celebration",
      "family gathering around a ceremonial display",
    ],
    outfit: [
      "a ceremonial robe with delicate patterns",
      "a soft festival coat with subtle symbols",
      "a cozy outfit inspired by traditional garments",
      "a simple celebratory jacket with small motifs",
    ],
  },
  posadas: {
    design: [
      "lantern-lit neighborhood celebration",
      "holiday street procession through a village",
      "festive gathering in a town plaza",
      "evening celebration with hanging decorations",
    ],
    outfit: [
      "a poncho with festive patterns",
      "a layered shawl inspired by traditional textiles",
      "a celebratory cloak with tassels and embroidery",
      "a storyteller's cape with procession details",
    ],
  },
  lucia: {
    design: [
      "Nordic winter morning procession",
      "quiet chapel ceremony atmosphere",
      "Scandinavian winter celebration",
      "soft dawn light in a northern village",
    ],
    outfit: [
      "a ceremonial gown with a simple crown",
      "a flowing robe inspired by Lucia traditions",
      "a minimal dress with a sash and headpiece",
      "a long ritual gown with delicate details",
    ],
  },
  threeKings: {
    design: [
      "procession of three wise travelers",
      "epic holiday parade in a town",
      "royal journey under a guiding star",
      "story of travelers bringing gifts",
    ],
    outfit: [
      "a miniature royal cloak with ornate trim",
      "a storyteller's robe with regal patterns",
      "a traveler king outfit with rich fabrics",
      "a ceremonial mantle inspired by the Magi",
    ],
  },
  kwanzaa: {
    design: [
      "family gathering with symbolic objects",
      "celebration of heritage and community",
      "holiday table with meaningful items",
      "warm, reflective festival atmosphere",
    ],
    outfit: [
      "a coat inspired by traditional textiles",
      "a robe with repeating geometric patterns",
      "a wrap outfit with cultural motifs",
      "a ceremonial jacket with symbolic icons",
    ],
  },
  solstice: {
    design: [
      "ancient solstice ritual scene",
      "nighttime gathering near standing stones",
      "mystical ceremony under the stars",
      "enchanted woodland winter setting",
    ],
    outfit: [
      "a ritual cloak covered in sigils",
      "a long hooded robe with arcane markings",
      "a ceremonial garment with celestial symbols",
      "a witchy coat with mysterious details",
    ],
  },
  lunarNewYear: {
    design: [
      "traditional new year street celebration",
      "dragon and lion dance in a busy alley",
      "festival in an old town with decorations",
      "family celebration during new year festivities",
    ],
    outfit: [
      "a festival jacket with ornate patterns",
      "a tunic inspired by traditional garments",
      "a ceremonial outfit with intricate embroidery",
      "a celebratory robe with repeating motifs",
    ],
  },
  newYear: {
    design: [
      "midnight city celebration scene",
      "rooftop party with fireworks in the distance",
      "global countdown party atmosphere",
      "nighttime celebration with confetti and lights",
    ],
    outfit: [
      "a party jacket with subtle shimmer",
      "a sleek celebration outfit with metallic details",
      "a modern evening coat with festive trim",
      "a stylish outfit suited for a countdown party",
    ],
  },
  festivus: {
    design: [
      "plain apartment living room scene",
      "unadorned winter evening setting",
      "minimalist, almost empty holiday space",
      "mundane room with a simple pole in the corner",
    ],
    outfit: [
      "a simple sweater and plain pants",
      "a neutral jacket with no patterns",
      "an unremarkable outfit with basic details",
      "a minimal cardigan and casual trousers",
    ],
  },
  basemas: {
    design: [
      "futuristic onchain holiday scene",
      "sci-fi celebration with abstract glyphs",
      "digital-native winter festival setting",
      "minimal techno-holiday environment",
    ],
    outfit: [
      "a futurist coat with circuit-like seams",
      "a sleek techwear jacket with geometric panels",
      "a padded outfit with subtle glowing accents",
      "a minimalist layered coat with glyph motifs",
    ],
  },
} as const;

type HollyKey = keyof typeof HOLLY_MAP;

function pickRandom<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      hollyForm?: string;
      holidayKey?: string;
      color?: string;
    };

    const { hollyForm, holidayKey, color } = body;

    if (!hollyForm || !holidayKey || !color) {
      return NextResponse.json(
        { error: "Missing hollyForm, holidayKey, or color." },
        { status: 400 }
      );
    }

    const normalizedKey =
      typeof holidayKey === "string" ? holidayKey.trim() : "";
    const isValidKey = normalizedKey in HOLLY_MAP;
    const safeKey: HollyKey = (isValidKey
      ? normalizedKey
      : "christmas") as HollyKey;

    const holidayConfig = HOLLY_MAP[safeKey];
    const design = pickRandom(holidayConfig.design);
    const outfit = pickRandom(holidayConfig.outfit);

    const colorPhrase = color.trim().toLowerCase();

    // 🔑 FINAL PROMPT – color is the ONLY strong color
    const prompt = `
    ${STYLE_PLUSH}
    ${colorPhrase} accents throughout. A highly detailed plush ${hollyForm} character celebrating the ${safeKey} holiday,
    in a ${design} style, wearing a mostly ${colorPhrase} ${outfit},
    dominant ${colorPhrase} color palette, with vivid ${colorPhrase} accents,
    integrated into traditional ${safeKey} holiday colors and motifs,
    full body visible from head to toe, standing, centered in frame,
    cinematic lighting, glossy, detailed, 4k, mystical 3D toy aesthetic.
    `;
    
    
    const result = await fal.subscribe("fal-ai/stable-cascade", {
      input: {
        prompt,
        image_size: "square_hd",
        guidance_scale: 6, // a bit higher so it listens to the prompt more
        enable_safety_checker: true,
        num_images: 1,
      },
    });

    const imageUrl = (result as any)?.data?.images?.[0]?.url;

    if (!imageUrl) {
      return NextResponse.json(
        { error: "Image generation failed" },
        { status: 500 }
      );
    }

    return NextResponse.json({ imageUrl });
  } catch (err) {
    console.error("❌ Fal error:", err);
    return NextResponse.json(
      { error: "Fal generation error" },
      { status: 500 }
    );
  }
}
