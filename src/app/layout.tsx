import type { Metadata, Viewport } from "next";
import { Noto_Sans_JP } from "next/font/google";
import "./globals.css";
import BottomNav from "./components/BottomNav";
import Footer from "./components/Footer";
import Providers from "./components/Providers";

const notoSansJP = Noto_Sans_JP({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#e8725a",
};

export const metadata: Metadata = {
  title: "カゴトク - かしこく買い物、もっとおトク",
  description: "商品の価格を比較して、いちばんおトクなお店を見つけよう",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "カゴトク",
  },
  icons: {
    icon: [
      { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <head>
        {/* iOS スプラッシュスクリーン */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="カゴトク" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        {/* iPhone スプラッシュ (コーラルのグラデーション背景) */}
        <meta name="apple-mobile-web-app-orientations" content="portrait" />
        {/* Google AdSense */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8501138808023781"
          crossOrigin="anonymous"
        />
      </head>
      <body className={`${notoSansJP.variable} antialiased`}>
        <Providers>
          {children}
          <Footer />
          <BottomNav />
        </Providers>
      </body>
    </html>
  );
}
