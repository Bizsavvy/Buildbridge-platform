"use client"

import * as React from "react"
import { motion } from "framer-motion"
import CountUp from "react-countup"
import { Button } from "@/components/ui/Button"
import Link from "next/link"
import { ArrowRight, Users, Hammer } from "lucide-react"

interface HeroProps {
  stats: {
    totalFunded: number;
    totalTradespeople: number;
  };
}

export function Hero({ stats }: HeroProps) {
  return (
    <section className="relative overflow-hidden pt-16 pb-20 md:pt-24 md:pb-32">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-1/2 -z-10 h-[600px] w-[600px] -translate-x-1/2 translate-y-[-10%] rounded-full bg-primary/5 blur-[120px]" />
      
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center">
          {/* Eyebrow Pill */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6 inline-flex items-center rounded-full bg-primary/10 px-4 py-1.5 text-label-large font-bold text-primary border border-primary/20"
          >
            🇳🇬 Empowering Nigeria's Skilled Workforce
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-6 max-w-4xl text-display-small font-black tracking-tight text-on-surface md:text-display-medium lg:text-display-large"
          >
            Direct Investment in <span className="text-primary italic">Skilled Trades.</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-10 max-w-2xl text-body-large text-on-surface-variant md:text-headline-small"
          >
            BuildBridge connects verified African tradespeople with the capital they need to buy tools, scale businesses, and build our future.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 mb-16"
          >
            <Link href="/browse">
              <Button variant="primary" className="min-w-[180px]">
                Browse Needs
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/how-it-works">
              <Button variant="secondary" className="min-w-[180px]">
                How It Works
              </Button>
            </Link>
          </motion.div>

          {/* Live Counters */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-8 md:gap-16 p-8 rounded-3xl bg-surface border border-outline-variant shadow-sm"
          >
            <div className="flex flex-col items-center gap-2 px-8">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-2">
                <Hammer className="h-6 w-6" />
              </div>
              <div className="text-display-small font-black text-on-surface">
                <CountUp end={stats.totalFunded} separator="," prefix="₦" formattingFn={(val) => `₦${(val/1000000).toFixed(1)}M`} />
              </div>
              <div className="text-label-large text-on-surface-variant uppercase tracking-wider">
                Capital Deployed
              </div>
            </div>
            
            <div className="flex flex-col items-center gap-2 px-8 sm:border-l border-outline-variant">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-secondary/10 text-secondary mb-2">
                <Users className="h-6 w-6" />
              </div>
              <div className="text-display-small font-black text-on-surface">
                <CountUp end={stats.totalTradespeople} separator="," />
              </div>
              <div className="text-label-large text-on-surface-variant uppercase tracking-wider">
                Tradespeople Backed
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
