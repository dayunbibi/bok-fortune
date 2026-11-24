import type { Metadata, Viewport } from "next";
import "./globals.css";

// Vercel sets VERCEL_PROJECT_PRODUCTION_URL at build time, so the domain is never hardcoded.
const siteUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : "http://localhost:3000";

const description = "포잎이가 흔들어주는 복주머니에서 2027년 운세 쪽지를 뽑아보세요. 하루에 한 번, 새 복이 담겨요.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "2027 복주머니 운세",
  description,
  openGraph: { title: "2027 복주머니 운세 🧧", description, locale: "ko_KR", type: "website" },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: "#fbf4e6",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <head>
        {/* Korean fonts. Loaded with a link tag because next/font only preloads latin subsets */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* root layout = every page, so this rule doesn't apply in the app router */}
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Jua&family=Gowun+Dodum&family=Gowun+Batang:wght@400;700&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
