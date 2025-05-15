import "./globals.css";
import type { Metadata } from "next";
import { AuthProvider } from "@/contexts/AuthContext";
import { WalletContextProvider } from "@/contexts/WalletContext";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Geist, Geist_Mono } from "next/font/google";

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "FRAMP | Your TurboCharged Finance Buddy",
  description: "FRAMP makes it easy to convert between crypto and fiat, pay bills from your wallet, and automate savings with Solana.",
  metadataBase: new URL("https://framp.xyz"),
  openGraph: {
    title: "FRAMP | Your TurboCharged Finance Buddy",
    description: "Instantly convert crypto to cash, pay utility bills, and automate savings with Solana.",
    url: "https://framp.xyz",
    siteName: "Framp",
    images: ["/framp_cover.jpg"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "FRAMP | Your TurboCharged Finance Buddy",
    description: "Instantly convert crypto to cash, pay utility bills, and automate savings with Solana.",
    images: ["/framp_cover.jpg"],
    creator: "@frampHQ",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased font-sans`}
      >
        <ThemeProvider 
          attribute="class" 
          defaultTheme="system" 
          enableSystem 
          disableTransitionOnChange
        >
          <AuthProvider>
            <WalletContextProvider>
              {children}
            </WalletContextProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
