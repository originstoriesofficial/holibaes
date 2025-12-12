import type { Metadata } from "next";
import { Inter, Source_Code_Pro } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const sourceCodePro = Source_Code_Pro({
  subsets: ["latin"],
  variable: "--font-source-code-pro",
});

export async function generateMetadata(): Promise<Metadata> {
  const homeUrl =
    process.env.NEXT_PUBLIC_URL || "https://monjeria.vercel.app";

  return {
    title: "Holibae Labs",
    description: "AI Animation and Music Studio",
    other: {
      "fc:miniapp": JSON.stringify({
        version: "next",
        imageUrl: `${homeUrl}/preview.png`,
        button: {
          title: "Enter The Holibae Lab",
          action: {
            type: "launch_frame",
            name: "Holibae Labs",
            url: homeUrl,
          },
        },
      }),
    },
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${sourceCodePro.variable}`}
    >
      <body className="bg-[var(--bg)] text-[var(--green)] font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
