"use client"

import * as React from "react"
import { motion } from "framer-motion"
import CountUp from "react-countup"
import { Button } from "@/components/ui/Button"
import Link from "next/link"
import { ArrowRight, Users, Hammer, MapPin } from "lucide-react"

interface HeroProps {
  stats: {
    totalFunded: number;
    totalTradespeople: number;
  };
}

export function Hero({ stats }: HeroProps) {
  return (
    <section className="relative overflow-hidden pt-20 pb-16 md:pt-32 md:pb-24 mesh-bg">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          <div className="flex-1 text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-6 inline-flex items-center rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary border border-primary/20"
            >
              <MapPin className="mr-2 h-4 w-4" />
              Empowering Nigeria&apos;s Skilled Workforce
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mb-6 text-4xl font-extrabold tracking-tight text-slate-900 md:text-5xl lg:text-6xl"
            >
              Direct Investment in <br />
              <span className="text-gradient italic">Skilled Trades.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mb-10 max-w-2xl text-lg text-slate-600 md:text-xl lg:mx-0 mx-auto"
            >
              BuildBridge connects verified African tradespeople with the capital they need to buy tools, scale businesses, and build our future.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 mb-12 justify-center lg:justify-start"
            >
              <Link href="/browse" className="cursor-pointer">
                <Button variant="primary" className="min-w-[200px] shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all hover:-translate-y-0.5">
                  Browse Needs
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/onboarding" className="cursor-pointer">
                <Button variant="secondary" className="min-w-[200px]">
                  Join as Artisan
                </Button>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-wrap gap-8 justify-center lg:justify-start pt-8 border-t border-slate-200"
            >
              <div>
                <div className="text-3xl md:text-4xl font-extrabold text-slate-900">
                  <CountUp end={stats.totalFunded} separator="," prefix="₦" formattingFn={(val) => `₦${(val/1000000).toFixed(1)}M`} />
                </div>
                <div className="text-xs text-slate-500 uppercase tracking-widest font-semibold">Capital Deployed</div>
              </div>
              <div className="w-px h-12 bg-slate-200 hidden sm:block" />
              <div>
                <div className="text-3xl md:text-4xl font-extrabold text-slate-900">
                  <CountUp end={stats.totalTradespeople} separator="," />
                </div>
                <div className="text-xs text-slate-500 uppercase tracking-widest font-semibold">Tradespeople Backed</div>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9, rotate: 2 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex-1 relative"
          >
            <div className="relative z-10 rounded-[2.5rem] overflow-hidden shadow-2xl">
              <img 
                src="/hero_bridge_artisan_1776158964538.png" 
                alt="Nigerian Artisan Bridge" 
                className="w-full h-auto object-cover transform transition-transform duration-700 hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
            </div>
            
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl -z-10" />
            <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-secondary/10 rounded-full blur-3xl -z-10" />
            
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -bottom-6 -right-6 glass-card p-6 rounded-2xl hidden md:block"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg">
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-base font-bold text-slate-900">100% Direct</div>
                  <div className="text-sm text-slate-500">Verified Impact</div>
                </div>
              </div>
            </motion.div>
          </motion.div>

        </div>
      </div>
    </section>
  )
}