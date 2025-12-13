import type { Metadata } from "next";
import { Inter, Source_Code_Pro } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const sourceCodePro = Source_Code_Pro({
  subsets: ["latin"],
  variable: "--font-source-code-pro",
});

function getRootUrl() {
  const manual = process.env.NEXT_PUBLIC_URL;
  if (manual) return manual.replace(/\/$/, "");

  const vercel = process.env.VERCEL_URL;
  if (vercel) return `https://${vercel}`.replace(/\/$/, "");

  return "http://localhost:3000";
}

export async function generateMetadata(): Promise<Metadata> {
  const rootUrl = getRootUrl();

  return {
    metadataBase: new URL(rootUrl),
    title: "Holibae Labs",
    description: "AI Animation and Music Studio",
    openGraph: {
      title: "Holibae Labs",
      description: "AI Animation and Music Studio",
      url: rootUrl,
      images: [{ url: `${rootUrl}/hero.png` }],
    },
    twitter: {
      card: "summary_large_image",
      title: "Holibae Labs",
      description: "AI Animation and Music Studio",
      images: [`${rootUrl}/hero.png`],
    },
    other: {
      "fc:miniapp": JSON.stringify({
        version: "next",
        imageUrl: `${rootUrl}/preview.png`,
        button: {
          title: "Enter The Holibae Lab",
          action: {
            type: "launch_frame",
            name: "Holibae Labs",
            url: rootUrl,
          },
        },
      }),
      "base:app_id": "693c8a3535edc2b115ca44db",
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
      className={`light ${inter.variable} ${sourceCodePro.variable} text-[var(--foreground)] min-h-screen`}
      style={{
        backgroundColor: "#f7e8d0", // ✅ forces tan bg on html
      }}
    >
      <body
        className="min-h-screen flex flex-col items-center justify-center font-sans text-[var(--foreground)] transition-colors duration-300"
        style={{
          paddingTop: "env(safe-area-inset-top)",
          paddingBottom: "env(safe-area-inset-bottom)",
          backgroundColor: "#f7e8d0", // ✅ forces tan bg on body
        }}
      >
        <Providers>
          <main className="w-full max-w-4xl px-4 py-8">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
