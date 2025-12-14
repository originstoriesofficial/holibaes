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
    "header": "",
    "payload": "",
    "signature": ""
  
},

  "baseBuilder": {
    "ownerAddress": "0x1ffcD029CE51fFf63C2Cc32445779CDE27C0C40f"
  },
  "miniapp": {
      "version": "1",
      "name": "Holibae Labs",
      "iconUrl": "https://holibaes.vercel.app/icon.png",
      "homeUrl": "https://holibaes.vercel.app",
      "heroImageUrl": "https://holibaes.vercel.app/hero.png",
      "imageUrl": "https://holibaes.vercel.app/image.png",
      "splashImageUrl": "https://holibaes.vercel.app/holibae-splash.png",
      "splashBackgroundColor": "#0e1a14",
      "webhookUrl": "https://holibaes.vercel.app/api/webhook",
      "subtitle": "AI Animation and Music Studio",
      "description": "Create and mint your own Monje and craft a unique music anthem",
      "primaryCategory": "entertainment",
      "tags": ["music", "art", "holidays", "ai", "creativity"],
      "ogTitle": "Holibae Labs - AI Studio",
      "ogDescription": "Create, customize, and soundtrack your own Monje "
    
  }
}
