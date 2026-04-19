"use client"

import * as React from "react"
import { motion } from "framer-motion"
import CountUp from "react-countup"
import Link from "next/link"
import { Sparkles, ArrowUpRight } from "lucide-react"

interface HeroProps {
  stats: {
    totalFunded: number;
    totalTradespeople: number;
  };
}

export function Hero({ stats }: HeroProps) {
  return (
    <section className="relative overflow-hidden pt-32 pb-20 md:pt-48 md:pb-32 bg-white flex flex-col items-center text-center">
      {/* Background Decor */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
        <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] rounded-full bg-tertiary/10 blur-[120px]" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        {/* Decorative Floating Blobs */}
        <div className="absolute inset-0 pointer-events-none hidden lg:block">
          {[
             { top: '15%', left: '8%', delay: 0, bg: 'bg-primary/20' },
             { top: '25%', left: '20%', delay: 0.2, bg: 'bg-tertiary/15' },
             { top: '10%', right: '12%', delay: 0.4, bg: 'bg-primary/15' },
             { top: '35%', right: '6%', delay: 0.6, bg: 'bg-tertiary/20' },
          ].map((pos, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 0.6 }}
              transition={{ duration: 0.8, delay: pos.delay }}
              className={`absolute w-10 h-10 rounded-full ${pos.bg} blur-sm`}
              style={{ top: pos.top, left: pos.left, right: pos.right }}
            />
          ))}
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto mb-16 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 text-primary text-xs font-black uppercase tracking-widest mb-6 border border-primary/10"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Empowering Nigeria's Skilled Future
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tight leading-[0.95] text-on-surface mb-8"
          >
            Empower Change <br />
            <span className="relative inline-block mt-2">
              with Every <span className="text-primary italic">Support.</span>
              <motion.div 
                 initial={{ width: 0 }}
                 animate={{ width: '100%' }}
                 transition={{ delay: 0.8, duration: 0.8 }}
                 className="absolute -bottom-2 left-0 h-1.5 bg-yellow-400 rounded-full"
              />
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl font-medium text-on-surface-variant leading-relaxed max-w-2xl mx-auto mb-12"
          >
            Join a community of thousands backing the dreams of verified tradespeople. 
            From tailors to mechanics—your capital builds lives and legacies.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-5 justify-center items-center"
          >
            <Link 
              href="/browse" 
              className="w-full sm:w-auto h-16 px-10 rounded-full font-black text-lg bg-primary text-on-primary shadow-2xl shadow-primary/30 hover:shadow-primary/40 transition-all hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2"
            >
              Start Supporting
            </Link>
            <Link 
              href="/onboarding"
              className="h-16 px-10 rounded-full border-2 border-primary text-primary bg-transparent font-black text-lg transition-all flex items-center justify-center hover:bg-primary/5 active:scale-[0.98]"
            >
              Join as Artisan
            </Link>
          </motion.div>

        </div>

        {/* Gallery Grid */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {[
            { img: "tailor", label: "Fashion" },
            { img: "carpenter", label: "Woodwork" },
            { img: "baker", label: "Bakery" }
          ].map((item, i) => (
            <motion.div
              key={item.img}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + (i * 0.1), duration: 0.6 }}
              className="group relative h-56 sm:h-72 md:h-80 rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white cursor-pointer"
            >
              <img 
                src={`/images/hero/${item.img}.png`} 
                alt={item.label} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end justify-start p-8">
                <span className="text-white font-black text-xl tracking-wide uppercase">{item.label}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}