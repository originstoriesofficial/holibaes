const ROOT_URL =
  process.env.NEXT_PUBLIC_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : 'http://localhost:3000');

/**
 * MiniApp configuration object. Must follow the Farcaster MiniApp specification.
 *
 * @see {@link https://miniapps.farcaster.xyz/docs/guides/publishing}
 */
export const minikitConfig = {

  "accountAssociation": {
    "header": "eyJmaWQiOjEzMzE0LCJ0eXBlIjoiY3VzdG9keSIsImtleSI6IjB4RDY5OWM4MkVDRGQxN0E2RTk3RDcyNjRkMDM0MjlFRjVjNzM4RTJiMCJ9",
    "payload": "eyJkb21haW4iOiJtb25qZXJpYS52ZXJjZWwuYXBwIn0",
    "signature": "tv915xXSbH2H94C+S2IIR/4f3b7NsQik3HzkWavOOgNP3LtnPoDKowNQUNxokmdhMAm8lMmNvDj/JICZmtmR8hs="
  
},

  "baseBuilder": {
    "ownerAddress": "0x1ffcD029CE51fFf63C2Cc32445779CDE27C0C40f"
  },
  "miniapp": {
      "version": "1",
      "name": "La Monjeria",
      "iconUrl": "https://monjeria.vercel.app/icon.png",
      "homeUrl": "https://monjeria.vercel.app",
      "heroImageUrl": "https://monjeria.vercel.app/hero.png",
      "imageUrl": "https://monjeria.vercel.app/image.png",
      "splashImageUrl": "https://monjeria.vercel.app/splash.png",
      "splashBackgroundColor": "#ce19e6",
      "webhookUrl": "https://monjeria.vercel.app/api/webhook",
      "subtitle": "AI Animation and Music Studio",
      "description": "Create and mint your own Monje and craft a unique music anthem",
      "primaryCategory": "entertainment",
      "tags": ["music", "art", "nft", "ai", "creativity"],
      "ogTitle": "La Monjería - AI Studio",
      "ogDescription": "Create, customize, and soundtrack your own Monje on Base"
    
  }
}
