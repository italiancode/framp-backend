import { Metadata } from "next";
import WaitlistForm from "@/components/WaitlistForm";
import Layout from "@/components/layout/Layout";

export const metadata: Metadata = {
  title: "Join the FRAMP Waitlist | Your TurboCharged Finance Buddy",
  description: "Join the FRAMP waitlist to be among the first to experience the future of decentralized finance. FRAMP is the all-in-one hub with a blend of TradFi and DeFi to enhance your Ramping Experience.",
  openGraph: {
    title: "Join the FRAMP Waitlist | Your TurboCharged Finance Buddy",
    description: "Be among the first to experience the future of decentralized finance with FRAMP - the all-in-one hub with a blend of TradFi and DeFi.",
    images: [
      {
        url: "/framp_cover.jpg",
        width: 1200,
        height: 630,
        alt: "FRAMP - Your TurboCharged Finance Buddy",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Join the FRAMP Waitlist | Your TurboCharged Finance Buddy",
    description: "Be among the first to experience the future of decentralized finance with FRAMP.",
    images: ["/framp_cover.jpg"],
    creator: "@frampHQ",
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "/waitlist",
  },
};

export default function WaitlistPage() {
  return (
    <Layout>
      <WaitlistForm />
    </Layout>
  );
}
