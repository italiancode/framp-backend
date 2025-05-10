"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import Layout from "@/components/layout/Layout";
import { motion } from "framer-motion";
import {
  FaArrowRight,
  FaChartLine,
  FaExchangeAlt,
  FaShieldAlt,
} from "react-icons/fa";
import { RiBillFill } from "react-icons/ri";
import { Hexagon } from "lucide-react";
import { BackgroundElements } from "@/components/ui/BackgroundElements";

export default function Homepage() {
  const [isHovered, setIsHovered] = useState(false);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <Layout>
      {/* Hero Section */}
      <section className="min-h-[90vh] sm:min-h-[80vh] flex items-center justify-center bg-white dark:bg-background/90 py-10 sm:py-0 relative overflow-hidden">
        <BackgroundElements />
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12">
            <motion.div
              className="w-full lg:w-1/2 text-center lg:text-left"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight text-black dark:text-white mb-4">
                Your <span className="text-[#7b77b9]">Turbo</span>Charged
                <span className="block sm:inline"> Finance Buddy</span>
              </h1>
              <p className="text-lg sm:text-xl text-black/80 dark:text-white/80 max-w-xl mx-auto lg:mx-0 mb-8">
                The all-in-one hub with a blend of TradFi and DeFi to enhance
                your Ramping Experience
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button
                  size="lg"
                  asChild
                  className="bg-[#7b77b9] hover:bg-[#7b77b9]/90 text-white rounded-full"
                >
                  <Link href="/waitlist">
                    Join Waitlist <FaArrowRight className="ml-2" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  asChild
                  className="border-[#7b77b9]/30 hover:bg-[#7b77b9]/10 text-black dark:text-white rounded-full"
                >
                  <Link href="/about">Learn More</Link>
                </Button>
              </div>
            </motion.div>

            <motion.div
              className="w-full lg:w-1/2 mt-8 lg:mt-0 flex justify-center items-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <motion.div
                animate={{
                  y: isHovered ? -15 : 0,
                  transition: { duration: 0.5, ease: "easeInOut" },
                }}
              >
                <Image
                  src="/images/hero.svg"
                  alt="Framp"
                  width={600}
                  height={450}
                  className="max-w-full h-auto object-contain"
                  priority
                />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/95 dark:bg-muted/10">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div
            className="max-w-3xl mx-auto text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-black dark:text-white">
              Supercharging TradFi with Solana
            </h2>
            <p className="text-lg text-black/70 dark:text-white/70">
              Seamlessly bridge your digital assets with real-world needs
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            {/* Feature 1 */}
            <motion.div
              variants={item}
              className="bg-white dark:bg-background rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-black/10 dark:border-white/10"
            >
              <div className="w-12 h-12 rounded-full bg-[#7b77b9]/10 dark:bg-[#7b77b9]/20 flex items-center justify-center mb-4">
                <FaExchangeAlt className="text-[#7b77b9] h-5 w-5" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-black dark:text-white">
                On/Off Ramping
              </h3>
              <p className="text-black/70 dark:text-white/70">
                Convert between crypto and fiat currencies instantly with
                competitive rates.
              </p>
            </motion.div>

            {/* Feature 2 */}
            <motion.div
              variants={item}
              className="bg-white dark:bg-background rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-black/10 dark:border-white/10"
            >
              <div className="w-12 h-12 rounded-full bg-[#7b77b9]/10 dark:bg-[#7b77b9]/20 flex items-center justify-center mb-4">
                <RiBillFill className="text-[#7b77b9] h-5 w-5" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-black dark:text-white">
                Bill Payments
              </h3>
              <p className="text-black/70 dark:text-white/70">
                Pay essential bills directly from your wallet without third
                parties.
              </p>
            </motion.div>

            {/* Feature 3 */}
            <motion.div
              variants={item}
              className="bg-white dark:bg-background rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-black/10 dark:border-white/10"
            >
              <div className="w-12 h-12 rounded-full bg-[#7b77b9]/10 dark:bg-[#7b77b9]/20 flex items-center justify-center mb-4">
                <FaChartLine className="text-[#7b77b9] h-5 w-5" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-black dark:text-white">
                Automated Savings
              </h3>
              <p className="text-black/70 dark:text-white/70">
                Save a percentage automatically with every transaction you make.
              </p>
            </motion.div>

            {/* Feature 4 */}
            <motion.div
              variants={item}
              className="bg-white dark:bg-background rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-black/10 dark:border-white/10"
            >
              <div className="w-12 h-12 rounded-full bg-[#7b77b9]/10 dark:bg-[#7b77b9]/20 flex items-center justify-center mb-4">
                <FaShieldAlt className="text-[#7b77b9] h-5 w-5" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-black dark:text-white">
                Security First
              </h3>
              <p className="text-black/70 dark:text-white/70">
                Built on Solana with bank-grade security and lightning-fast
                transactions.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white dark:bg-background relative overflow-hidden">
        <BackgroundElements />
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div
            className="max-w-5xl mx-auto p-8 md:p-12 rounded-2xl backdrop-blur-sm relative overflow-hidden bg-white/50 dark:bg-background/50 border border-black/10 dark:border-white/10"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#7b77b9]/10 via-transparent to-[#7b77b9]/10 opacity-30"></div>
            <div className="relative z-10">
              <h2 className="text-2xl md:text-3xl font-bold mb-4 text-center text-black dark:text-white">
                Ready to revolutionize your financial experience?
              </h2>
              <p className="text-black/70 dark:text-white/70 text-center mb-8">
                Join thousands on our waitlist to be among the first to
                experience Framp.
              </p>
              <div className="flex justify-center">
                <Button
                  size="lg"
                  asChild
                  className="bg-[#7b77b9] hover:bg-[#7b77b9]/90 text-white px-8 rounded-full"
                >
                  <Link href="/waitlist">
                    Join Waitlist <FaArrowRight className="ml-2" />
                  </Link>
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}
