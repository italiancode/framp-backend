"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import Layout from '@/components/layout/Layout';
import { motion } from 'framer-motion';
import { FaArrowRight, FaChartLine, FaExchangeAlt, FaShieldAlt } from 'react-icons/fa';
import { RiBillFill } from 'react-icons/ri';

export default function Homepage() {
  const [isHovered, setIsHovered] = useState(false);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-background to-background/80 dark:from-background dark:to-background/90 pt-16 md:pt-24 pb-24">
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] dark:opacity-[0.05]"></div>
        
        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <motion.div 
            className="max-w-6xl mx-auto text-center mb-16 sm:mb-24"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-violet-600 leading-tight mb-6">
              Your TurboCharged Finance Buddy
            </h1>
            <p className="text-lg md:text-xl text-foreground/80 max-w-3xl mx-auto mb-8 leading-relaxed">
              The all-in-one hub with a seamless blend of TradFi and DeFi to enhance your Ramping Experience.
              Convert crypto to cash, pay bills, and automate savings on Solana.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                asChild
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 rounded-full"
              >
                <Link href="/login">
                  Join Waitlist <FaArrowRight className="ml-2" />
                </Link>
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                asChild
                className="bg-background/50 backdrop-blur border-primary/20 hover:bg-primary/5 text-foreground rounded-full"
              >
                <Link href="/product">
                  Learn More
                </Link>
              </Button>
            </div>
          </motion.div>

          <motion.div 
            className="relative mx-auto w-full max-w-5xl h-[300px] sm:h-[400px] md:h-[500px]"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.7 }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <motion.div
              animate={{ 
                y: isHovered ? -10 : 0,
                rotate: isHovered ? -2 : 0,
                transition: { duration: 0.4 }
              }}
              className="absolute inset-0 flex justify-center items-center"
            >
              <Image 
                src="/images/hero.svg" 
                alt="Framp Dashboard" 
                width={700} 
                height={400}
                className="object-cover rounded-2xl shadow-2xl shadow-primary/20 dark:shadow-primary/10"
                priority
              />
            </motion.div>
          </motion.div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-1/3 -left-20 w-72 h-72 bg-primary/10 rounded-full filter blur-3xl opacity-30 dark:opacity-20 animate-blob"></div>
        <div className="absolute top-2/3 -right-20 w-72 h-72 bg-violet-700/10 rounded-full filter blur-3xl opacity-30 dark:opacity-20 animate-blob animation-delay-2000"></div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/50 dark:bg-muted/10">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div 
            className="max-w-3xl mx-auto text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Supercharging TradFi with Solana</h2>
            <p className="text-lg text-foreground/70">Seamlessly bridge your digital assets with real-world needs</p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            {/* Feature 1 */}
            <motion.div variants={item} className="bg-background rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-border/50">
              <div className="w-12 h-12 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center mb-4">
                <FaExchangeAlt className="text-primary h-5 w-5" />
              </div>
              <h3 className="text-xl font-semibold mb-2">On/Off Ramping</h3>
              <p className="text-foreground/70">Convert between crypto and fiat currencies instantly with competitive rates.</p>
            </motion.div>

            {/* Feature 2 */}
            <motion.div variants={item} className="bg-background rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-border/50">
              <div className="w-12 h-12 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center mb-4">
                <RiBillFill className="text-primary h-5 w-5" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Bill Payments</h3>
              <p className="text-foreground/70">Pay essential bills directly from your wallet without third parties.</p>
            </motion.div>

            {/* Feature 3 */}
            <motion.div variants={item} className="bg-background rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-border/50">
              <div className="w-12 h-12 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center mb-4">
                <FaChartLine className="text-primary h-5 w-5" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Automated Savings</h3>
              <p className="text-foreground/70">Save a percentage automatically with every transaction you make.</p>
            </motion.div>

            {/* Feature 4 */}
            <motion.div variants={item} className="bg-background rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-border/50">
              <div className="w-12 h-12 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center mb-4">
                <FaShieldAlt className="text-primary h-5 w-5" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Security First</h3>
              <p className="text-foreground/70">Built on Solana with bank-grade security and lightning-fast transactions.</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary/5 to-violet-600/5">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div 
            className="max-w-4xl mx-auto bg-background rounded-2xl p-8 md:p-12 shadow-xl border border-primary/10 relative overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-violet-600/10 opacity-30"></div>
            <div className="relative z-10">
              <h2 className="text-2xl md:text-3xl font-bold mb-4 text-center">Ready to revolutionize your financial experience?</h2>
              <p className="text-foreground/70 text-center mb-8">Join thousands on our waitlist to be among the first to experience Framp.</p>
              <div className="flex justify-center">
                <Button 
                  size="lg" 
                  asChild
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 rounded-full"
                >
                  <Link href="/login">
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
