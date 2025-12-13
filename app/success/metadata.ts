import type { Metadata } from "next";

const APP_URL = "https://holibaes.vercel.app"; // Change if needed

export const metadata: Metadata = {
  title: "Monk Minted!",
  description: "Your Monk is now live on Base 🧘‍♂️",
  openGraph: {
    title: "Basemonks — Mint Complete",
    description: "Your monk has been minted successfully.",
    images: [`${APP_URL}/og.png`],
    url: `${APP_URL}/success`,
  },
  other: {
    "fc:frame": JSON.stringify({
      version: "next",
      imageUrl: `${APP_URL}/og.png`,
      button: {
        title: "View My Monk",
        action: {
          type: "launch_frame",
          url: `${APP_URL}/create`,
          name: "Basemonks",
          splashImageUrl: `${APP_URL}/icon.png`,
          splashBackgroundColor: "#000000",
        },
      },
    }),
  },
};
