import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Framp | Finance Reimagined",
  description:
    "On/Off ramping, bill payments, and smart savings—all from your wallet.",
  metadataBase: new URL("https://framp.xyz"),
  openGraph: {
    title: "Framp | Finance Reimagined",
    description:
      "On/Off ramping, bill payments, and smart savings—all from your wallet.",
    url: "https://framp.xyz",
    siteName: "Framp",
    images: [
      {
        url: "/og-image.png", // place this image in public/
        width: 1200,
        height: 630,
        alt: "Framp Open Graph Image",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Framp | Finance Reimagined",
    description:
      "On/Off ramping, bill payments, and smart savings—all from your wallet.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/favicon.ico",
  },

  themeColor: "#4F46E5",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
