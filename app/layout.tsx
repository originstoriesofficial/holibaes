import type { Metadata } from "next";
import { Inter, Source_Code_Pro } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {

  other: {
    'base:app_id': '693c8a3535edc2b115ca44db',
  },
};



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
      className={`${inter.variable} ${sourceCodePro.variable} bg-[#f5f2eb]`}
    >
      <body
        className="min-h-screen bg-[#f5f2eb] text-[var(--green)] font-sans"
        style={{
          paddingTop: "env(safe-area-inset-top)",
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
