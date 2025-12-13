import { NextResponse } from "next/server";
import { fal } from "@fal-ai/client";

fal.config({
  credentials: process.env.FAL_KEY!,
});

// Single plush style used everywhere (matches your "it needs to be like this")
const STYLE_PLUSH = `
plush-doll proportions, soft rounded silhouette, velvety texture,
cute expressive eyes, collectible figurine energy,
full-body, standing on a small surface, centered composition,
gentle diffusion glow, premium toy photography lighting,
hyper-detailed 3D render
`.trim();

const HOLLY_MAP = {
  christmas: {
    design: [
      "warm fireplace and holiday gathering mood style",
      "a cozy living room with a tree and wrapped presents",
      "classic storybook holiday setting",
      "snowy village and festive decorations",
    ],
    outfit: [
      "a mostly blue cozy holiday sweater and boots",
      "an ugly Christmas sweater with knitted patterns (no text) and boots",
      "a cozy winter coat with festive trim and boots",
    ],
    motifs: [
      "a twinkling mantle with stockings and garland",
      "wrapped gifts with ribbons (no text)",
      "string lights with soft bokeh glow",
    ],
  },

  hanukkah: {
    design: [
      "candlelit festival atmosphere in a cozy home",
      "peaceful winter evening celebration",
    ],
    outfit: [
      "a cozy outfit inspired by traditional garments",
      "a soft shawl with subtle star-like stitching (no text)",
    ],
    motifs: [
      "a hanukkiah (menorah) with candles visibly lit (no text)",
      "a small dreidel on the surface (no letters visible)",
    ],
  },

  posadas: {
    design: [
      "lantern-lit neighborhood celebration scene",
      "a courtyard celebration with papel picado overhead",
    ],
    outfit: [
      "a poncho with festive patterns and boots",
      "a traditional rebozo-style shawl and boots",
    ],
    motifs: [
      "papel picado banners (no text)",
      "a star-shaped piñata silhouette in the background",
    ],
  },

  lucia: {
    design: [
      "Scandinavian winter celebration with soft dawn light",
      "a candlelit hallway procession scene",
    ],
    outfit: ["a white robe with a simple sash (no text)"],
    motifs: ["a candle crown headpiece (non-text)", "handheld candle(s) as a visible prop"],
  },

  threeKings: {
    design: [
      "royal journey under a guiding star",
      "town celebration welcoming gift-bringers",
    ],
    outfit: ["a miniature royal cloak with ornate trim and boots"],
    motifs: ["a guiding star symbol in the sky (no text)", "gift boxes at the character’s feet (no text)"],
  },

  kwanzaa: {
    design: ["warm, reflective festival atmosphere in a home setting"],
    outfit: ["a kente-inspired sash and patterned coat (pattern only, no text)"],
    motifs: ["a kinara (seven-candle holder) centerpiece (no text)", "a woven mat (mkeka) under ceremonial items"],
  },

  solstice: {
    design: ["enchanted woodland winter setting with mystical ceremony atmosphere"],
    outfit: ["a long hooded robe with arcane markings (no text)"],
    motifs: ["standing stones in the background", "ritual candles and ceremonial objects (no text)"],
  },

  lunarNewYear: {
    design: ["a lantern-lined street with parade energy", "a temple courtyard festival scene (non-text)"],
    outfit: ["a silk-like jacket with knot-button details (no text) and boots"],
    motifs: ["lantern festival decor (no text)", "red-envelope shapes as props (blank, no characters)"],
  },

  newYear: {
    design: ["nighttime celebration with confetti and lights", "a glittery party backdrop with streamers"],
    outfit: ["a sleek celebration outfit with metallic details (no logos)"],
    motifs: ["fireworks in the distance", "confetti and sparkling bokeh (no numbers/text)"],
  },

  festivus: {
    design: ["plain apartment living room scene with minimal decor"],
    outfit: ["a simple sweater and plain pants (no text)"],
    motifs: ["a simple pole in the corner"],
  },

  // ✅ Sinterklaas (NL-specific) — includes the required shoe-by-fireplace identity
  sinterklaas: {
    design: [
      "Dutch winter living room celebration, cozy canal-house interior, premium collectible toy photography",
      "evening shoe-by-the-fireplace tradition scene, minimal but unmistakably sinterklaas-themed",
    ],
    outfit: [
      "a cozy knit sweater with simple festive stitching (no text) and boots",
      "a cape-like coat with classic trim and boots (storybook vibe)",
    ],
    motifs: [
      "a child’s shoe placed by the fireplace with small treats nearby",
      "peppernoten / kruidnoten scattered on a plate",
      "gift parcels wrapped in simple paper (no text)",
    ],
  },

  basemas: {
    design: ["futuristic onchain holiday scene with minimal techno-holiday environment"],
    outfit: ["a sleek techwear jacket with geometric panels and boots (no logos)"],
    motifs: ["glowing network lines in the environment", "floating token-like charms (blank, no markings)"],
  },
} as const;

type HollyKey = keyof typeof HOLLY_MAP;

function pickRandom<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Negative prompt: keep it focused and avoid conflicting with “warm fireplace” scenes.
 * Only block orange-ish things when the requested palette is NOT orange.
 */
function buildNegativePrompt(args: { safeKey: HollyKey; colorPhrase: string }) {
  const { safeKey, colorPhrase } = args;

  const base = [
    "text",
    "letters",
    "watermark",
    "logo",
    "brand name",
    "lowres",
    "blurry",
    "deformed",
    "extra limbs",
    "cropped",
    "out of frame",
  ];

  // If user wants a non-orange palette, discourage orange subject elements
  const wantsOrange = /orange|ginger|pumpkin|tangerine/.test(colorPhrase);
  if (!wantsOrange) {
    base.push("orange fur", "orange plush", "pumpkin color", "ginger hair");
  }

  // stop generic christmas bleed for non-christmas holidays
  if (safeKey !== "christmas") {
    base.push("santa hat", "christmas tree", "candy cane");
  }

  return base.join(", ");
}

/**
 * ✅ Prompt format rewritten to match the working pattern you posted:
 * "STYLE..., SUBJECT..., SCENE..., WARDROBE..., dominant COLOR palette..., integrated motifs..., full body..., cinematic lighting..."
 */
function buildPrompt(args: {
  hollyForm: string;
  safeKey: HollyKey;
  design: string;
  outfit: string;
  motif: string;
  colorPhrase: string;
}) {
  const { hollyForm, safeKey, design, outfit, motif, colorPhrase } = args;

  // Keep the “ginger is a theme, not a color” note (but don’t force “avoid warm orange lighting” globally)
  const gingerNote =
    `SUBJECT NOTE: the word "ginger" (if present) refers to a theme/name, NOT an orange color.`;

  // This mirrors the example: dominant blue palette + vivid accents + integrated into traditional holiday motifs
  const colorLine = `dominant ${colorPhrase} color palette, with vivid ${colorPhrase} accents`;

  const holidayIdentity = `HOLIDAY IDENTITY (must be visible): ${motif}`;

  return `
${STYLE_PLUSH}, 
A highly detailed plush ${hollyForm}, leader character celebrating the ${safeKey} holiday,
in a ${design},
wearing ${outfit},
${colorLine},
integrated into traditional ${safeKey} holiday colors and ${colorLine} and motifs,
${holidayIdentity},
full body visible from head to toe, standing, centered in frame,
cinematic lighting, glossy, detailed, 4k, mystical 3D toy aesthetic.
${gingerNote}
`.trim();
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      hollyForm?: string;
      holidayKey?: string;
      color?: string;
      address?: string;
    };

    const hollyForm = body?.hollyForm?.trim();
    const holidayKeyRaw = body?.holidayKey?.trim();
    const colorPhrase = body?.color?.trim().toLowerCase();
    const address = body?.address;

    if (!hollyForm || !holidayKeyRaw || !colorPhrase) {
      return NextResponse.json(
        { error: "Missing hollyForm, holidayKey, or color." },
        { status: 400 }
      );
    }

    const safeKey: HollyKey = (holidayKeyRaw in HOLLY_MAP
      ? (holidayKeyRaw as HollyKey)
      : "christmas");

    const cfg = HOLLY_MAP[safeKey];
    const design = pickRandom(cfg.design);
    const outfit = pickRandom(cfg.outfit);
    const motif = pickRandom(cfg.motifs);

    const prompt = buildPrompt({
      hollyForm,
      safeKey,
      design,
      outfit,
      motif,
      colorPhrase,
    });

    const negative_prompt = buildNegativePrompt({ safeKey, colorPhrase });

    console.log("🎨 Generating for address:", address ?? "[missing]");
    console.log("🧵 Prompt:\n", prompt);
    console.log("🚫 Negative:\n", negative_prompt);

    const result = await fal.subscribe("fal-ai/stable-cascade", {
      input: {
        prompt,
        negative_prompt,
        image_size: "square_hd",
        guidance_scale: 6,
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
    return NextResponse.json({ error: "Fal generation error" }, { status: 500 });
  }
}
