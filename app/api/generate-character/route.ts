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
      "a twinkling mantle with stockings and garland",
      "a cozy living room with a tree and wrapped presents",
      "a festive toyshop window display with ornaments",
      "a snowy front porch with wreaths and lights",
    ],
    outfit: [
      "a winter coat with festive details",
      "a cozy holiday sweater and boots",
      "a vintage toyshop-inspired outfit",
      "a scarf and hat with subtle holiday patterns",
      "an ugly Christmas sweater with knitted patterns (no text)",
      "a Santa hat with fluffy trim",
      "a reindeer onesie pajama suit",
      "a cozy knit cardigan with jingle bell buttons",
    ],
    motifs: [
      "pine garland and ornaments",
      "wrapped gifts with ribbons (no text)",
      "snowflakes and festive decor",
      "a small decorated tree in the background",
      "stockings hanging from a fireplace mantle",
      "a wreath on the wall or door",
      "string lights with soft bokeh glow",
      "a snow globe on the surface beside the character",
    ],
  },

  hanukkah: {
    design: [
      "candlelit festival atmosphere",
      "Hanukkah storybook setting",
      "peaceful winter evening celebration",
      "family gathering around a ceremonial display",
      "a cozy home table set for a candle-lighting moment",
      "a softly lit window scene with winter night outside",
    ],
    outfit: [
      "a ceremonial robe with delicate patterns",
      "a soft festival coat with subtle symbols",
      "a cozy outfit inspired by traditional garments",
      "a simple celebratory jacket with small motifs",
      "a soft shawl with subtle star-like stitching (no text)",
      "a small kippah (yarmulke) as a simple headpiece",
    ],
    motifs: [
      "a hanukkiah (menorah) with candles visibly lit (no text)",
      "a small dreidel on the surface (no letters visible)",
      "a plate of sufganiyot (jelly donuts) as a prop",
      "a small stack of gelt-like coins (generic, no markings)",
      "a ceremonial table arrangement with candlelight glow",
    ],
  },

  posadas: {
    design: [
      "lantern-lit neighborhood celebration",
      "holiday street procession through a village",
      "festive gathering in a town plaza",
      "evening celebration with hanging decorations",
      "a courtyard celebration with papel picado overhead",
      "a warm street scene with lanterns and procession energy",
    ],
    outfit: [
      "a poncho with festive patterns",
      "a layered shawl inspired by traditional textiles",
      "a celebratory cloak with tassels and embroidery",
      "a storyteller's cape with procession details",
      "a traditional rebozo-style shawl",
      "a small woven sash and embroidered trim",
    ],
    motifs: [
      "paper lanterns and hanging decorations",
      "papel picado banners (no text)",
      "a star-shaped piñata silhouette in the background",
      "poinsettia flowers as decor accents",
      "a small candle lantern held or placed nearby",
      "procession-inspired festive decor in-frame",
    ],
  },

  lucia: {
    design: [
      "Nordic winter morning procession",
      "quiet chapel ceremony atmosphere",
      "Scandinavian winter celebration",
      "soft dawn light in a northern village",
      "a candlelit hallway procession scene",
      "a calm snowy morning with soft choir-procession energy",
    ],
    outfit: [
      "a ceremonial gown with a simple crown",
      "a flowing robe inspired by Lucia traditions",
      "a minimal dress with a sash and headpiece",
      "a long ritual gown with delicate details",
      "a white robe with a simple sash (no text)",
    ],
    motifs: [
      "a candle crown headpiece (non-text)",
      "handheld candle(s) as a visible prop",
      "subtle procession elements (choir silhouettes, soft candles)",
      "chapel-like ceremonial details",
    ],
  },

  threeKings: {
    design: [
      "procession of three wise travelers",
      "epic holiday parade in a town",
      "royal journey under a guiding star",
      "story of travelers bringing gifts",
      "a desert-night caravan scene with a bright guiding star",
      "a town celebration welcoming gift-bringers",
    ],
    outfit: [
      "a miniature royal cloak with ornate trim",
      "a storyteller's robe with regal patterns",
      "a traveler king outfit with rich fabrics",
      "a ceremonial mantle inspired by the Magi",
      "a small crown or turban-like headpiece (non-text)",
    ],
    motifs: [
      "a guiding star symbol in the sky (no text)",
      "gift boxes or ornate containers at the character’s feet",
      "traveling caravan-inspired scene elements",
      "royal procession decor details",
    ],
  },

  kwanzaa: {
    design: [
      "family gathering with symbolic objects",
      "celebration of heritage and community",
      "holiday table with meaningful items",
      "warm, reflective festival atmosphere",
      "a home setting with a ceremonial table centerpiece",
      "a community gathering vibe with crafted decor",
    ],
    outfit: [
      "a coat inspired by traditional textiles",
      "a robe with repeating geometric patterns",
      "a wrap outfit with cultural motifs",
      "a ceremonial jacket with symbolic icons",
      "a kente-inspired pattern sash (pattern only, no text)",
      "a dashiki-inspired tunic silhouette with woven trim",
    ],
    motifs: [
      "a kinara (seven-candle holder) centerpiece (no text)",
      "a woven mat (mkeka) under ceremonial items",
      "a bowl of fruit as a harvest symbol",
      "handmade crafts as decor accents",
      "geometric textile motifs in the environment",
    ],
  },

  solstice: {
    design: [
      "ancient solstice ritual scene",
      "nighttime gathering near standing stones",
      "mystical ceremony under the stars",
      "enchanted woodland winter setting",
      "a bonfire circle in a snowy forest clearing",
      "a moonlit ritual scene with frost and starlight",
    ],
    outfit: [
      "a ritual cloak covered in sigils",
      "a long hooded robe with arcane markings",
      "a ceremonial garment with celestial symbols",
      "a witchy coat with mysterious details",
    ],
    motifs: [
      "standing stones in the background",
      "celestial symbols and constellations (no text)",
      "ritual candles and ceremonial objects",
      "a bonfire glow in the distance",
      "winter herbs/wreath-like natural talismans",
    ],
  },

  lunarNewYear: {
    design: [
      "traditional new year street celebration",
      "dragon and lion dance in a busy alley",
      "festival in an old town with decorations",
      "family celebration during new year festivities",
      "a lantern-lined street with parade energy",
      "a temple courtyard festival scene (non-text)",
    ],
    outfit: [
      "a festival jacket with ornate patterns",
      "a tunic inspired by traditional garments",
      "a ceremonial outfit with intricate embroidery",
      "a celebratory robe with repeating motifs",
      "a silk-like jacket with knot-button details (no text)",
    ],
    motifs: [
      "lantern festival decor (no text)",
      "dragon/lion dance silhouettes in the background",
      "firecracker ribbon decor (no text)",
      "red-envelope shapes as props (blank, no characters)",
      "ornate celebratory ornaments",
    ],
  },

  newYear: {
    design: [
      "midnight city celebration scene",
      "rooftop party with fireworks in the distance",
      "global countdown party atmosphere",
      "nighttime celebration with confetti and lights",
      "a champagne-bokeh skyline scene",
      "a glittery party backdrop with streamers",
    ],
    outfit: [
      "a party jacket with subtle shimmer",
      "a sleek celebration outfit with metallic details",
      "a modern evening coat with festive trim",
      "a stylish outfit suited for a countdown party",
      "a sequin-like jacket texture (no logos)",
    ],
    motifs: [
      "fireworks in the distance",
      "confetti and sparkling bokeh (no numbers/text)",
      "party lights and celebratory decor",
      "champagne-glass silhouettes (no branding)",
      "party hats (blank, no text)",
    ],
  },

  festivus: {
    design: [
      "plain apartment living room scene",
      "unadorned winter evening setting",
      "minimalist, almost empty holiday space",
      "mundane room with a simple pole in the corner",
      "a dull room with harsh overhead lighting",
    ],
    outfit: [
      "a simple sweater and plain pants",
      "a neutral jacket with no patterns",
      "an unremarkable outfit with basic details",
      "a minimal cardigan and casual trousers",
    ],
    motifs: [
      "a simple pole in the corner",
      "plain room with minimal decor",
      "mundane household objects",
      "intentionally un-festive setting",
    ],
  },

  // ✅ add Sinterklaas (NL-specific)
  sinterklaas: {
    design: [
      "Dutch winter living room celebration",
      "cozy canal-house interior with holiday treats on a table",
      "evening shoe-by-the-fireplace tradition scene",
      "warm family gathering in a Dutch home",
    ],
    outfit: [
      "a cozy knit sweater with simple festive stitching (no text)",
      "a cape-like coat with classic trim (storybook vibe)",
      "a small beret-style cap (non-text)",
      "a playful helper-inspired outfit with puffed sleeves (non-text)",
    ],
    motifs: [
      "a child’s shoe placed by the fireplace with small treats nearby",
      "peppernoten / kruidnoten scattered on a plate",
      "a burlap sack as a background prop (neutral, no markings)",
      "a small boat silhouette or harbor hint in the background (subtle)",
      "gift parcels wrapped in simple paper (no text)",
    ],
  },

  basemas: {
    design: [
      "futuristic onchain holiday scene",
      "sci-fi celebration with abstract glyphs",
      "digital-native winter festival setting",
      "minimal techno-holiday environment",
      "a sleek neon-lit gallery space with floating ornaments",
      "a holographic festival plaza with soft fog and glow",
    ],
    outfit: [
      "a futurist coat with circuit-like seams",
      "a sleek techwear jacket with geometric panels",
      "a padded outfit with subtle glowing accents",
      "a minimalist layered coat with glyph motifs",
      "a visor-like head accessory (no logos)",
    ],
    motifs: [
      "onchain glyph garlands (no text)",
      "blockchain-shaped ornaments",
      "glowing network lines in the environment",
      "abstract Base-inspired iconography (no logos/text)",
      "floating token-like charms (blank, no markings)",
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
    const motifs = pickRandom(holidayConfig.motifs);

    const colorPhrase = color.trim().toLowerCase();

    // 🔑 FINAL PROMPT – color is the ONLY strong color
    const prompt = `
    ${STYLE_PLUSH}
    ${colorPhrase} accents throughout. A highly detailed plush ${hollyForm} character celebrating the ${safeKey} holiday,
    in a ${design} style, wearing a mostly ${colorPhrase} ${outfit},
    dominant ${colorPhrase} color palette, with vivid ${motifs} accents,
    integrated into traditional ${safeKey} holiday colors and ${motifs},
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
