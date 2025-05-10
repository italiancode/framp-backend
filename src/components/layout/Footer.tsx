"use client";

import Image from "next/image";
import Link from "next/link";
import { useTheme } from "next-themes";
import {
  FaTwitter,
  FaDiscord,
  FaTelegram,
  FaGithub,
  FaLinkedin,
} from "react-icons/fa";

export default function Footer() {
  const { theme } = useTheme();

  return (
    <footer className="w-full border-t border-black/10 dark:border-white/10 bg-white dark:bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="block mb-6">
              <Image
                src={
                  theme === "dark"
                    ? "/images/logo-dark.svg"
                    : "/images/logo.svg"
                }
                alt="Framp"
                width={120}
                height={40}
                className="h-10 w-auto"
              />
            </Link>
            <p className="text-sm text-black/70 dark:text-white/70 mb-6 max-w-xs">
              Framp bridges digital assets with real-world needs, making crypto
              on/off ramping seamless.
            </p>
            <div className="flex space-x-4">
              <Link
                href="https://twitter.com"
                target="_blank"
                className="text-black/70 dark:text-white/70 hover:text-[#7b77b9] dark:hover:text-[#9f9ddb] transition-colors"
              >
                <FaTwitter className="h-5 w-5" />
              </Link>
              <Link
                href="https://discord.com"
                target="_blank"
                className="text-black/70 dark:text-white/70 hover:text-[#7b77b9] dark:hover:text-[#9f9ddb] transition-colors"
              >
                <FaDiscord className="h-5 w-5" />
              </Link>
              <Link
                href="https://telegram.org"
                target="_blank"
                className="text-black/70 dark:text-white/70 hover:text-[#7b77b9] dark:hover:text-[#9f9ddb] transition-colors"
              >
                <FaTelegram className="h-5 w-5" />
              </Link>
              <Link
                href="https://github.com"
                target="_blank"
                className="text-black/70 dark:text-white/70 hover:text-[#7b77b9] dark:hover:text-[#9f9ddb] transition-colors"
              >
                <FaGithub className="h-5 w-5" />
              </Link>
              <Link
                href="https://linkedin.com"
                target="_blank"
                className="text-black/70 dark:text-white/70 hover:text-[#7b77b9] dark:hover:text-[#9f9ddb] transition-colors"
              >
                <FaLinkedin className="h-5 w-5" />
              </Link>
            </div>
          </div>

          <div className="col-span-1">
            <h3 className="font-semibold text-lg mb-4 text-black dark:text-white">
              Products
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/ramp"
                  className="text-black/70 dark:text-white/70 hover:text-[#7b77b9] dark:hover:text-[#9f9ddb] transition-colors"
                >
                  On/Off Ramp
                </Link>
              </li>

              <li>
                <Link
                  href="/bill-payments"
                  className="text-black/70 dark:text-white/70 hover:text-[#7b77b9] dark:hover:text-[#9f9ddb] transition-colors"
                >
                  Bill Payments
                </Link>
              </li>
              <li>
                <Link
                  href="/savings"
                  className="text-black/70 dark:text-white/70 hover:text-[#7b77b9] dark:hover:text-[#9f9ddb] transition-colors"
                >
                  Automated Savings
                </Link>
              </li>
            </ul>
          </div>

          <div className="col-span-1">
            <h3 className="font-semibold text-lg mb-4 text-black dark:text-white">
              Resources
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/documentation"
                  className="text-black/70 dark:text-white/70 hover:text-[#7b77b9] dark:hover:text-[#9f9ddb] transition-colors"
                >
                  Documentation
                </Link>
              </li>
              <li>
                <Link
                  href="/help"
                  className="text-black/70 dark:text-white/70 hover:text-[#7b77b9] dark:hover:text-[#9f9ddb] transition-colors"
                >
                  Help Center
                </Link>
              </li>
              <li>
                <Link
                  href="/blog"
                  className="text-black/70 dark:text-white/70 hover:text-[#7b77b9] dark:hover:text-[#9f9ddb] transition-colors"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  href="/security"
                  className="text-black/70 dark:text-white/70 hover:text-[#7b77b9] dark:hover:text-[#9f9ddb] transition-colors"
                >
                  Security
                </Link>
              </li>
            </ul>
          </div>

          <div className="col-span-1">
            <h3 className="font-semibold text-lg mb-4 text-black dark:text-white">
              Company
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/about"
                  className="text-black/70 dark:text-white/70 hover:text-[#7b77b9] dark:hover:text-[#9f9ddb] transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/careers"
                  className="text-black/70 dark:text-white/70 hover:text-[#7b77b9] dark:hover:text-[#9f9ddb] transition-colors"
                >
                  Careers
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-black/70 dark:text-white/70 hover:text-[#7b77b9] dark:hover:text-[#9f9ddb] transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-black/70 dark:text-white/70 hover:text-[#7b77b9] dark:hover:text-[#9f9ddb] transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-black/10 dark:border-white/10 mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-sm text-black/60 dark:text-white/60">
            &copy; {new Date().getFullYear()} Framp. All rights reserved.
          </p>
          <div className="mt-4 sm:mt-0 text-sm text-black/60 dark:text-white/60">
            <span>Built on </span>
            <span className="text-[#7b77b9] dark:text-[#9f9ddb]">Solana</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
