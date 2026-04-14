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
    <section className="relative overflow-hidden pt-28 pb-16 md:pt-40 md:pb-24 min-h-[90vh] bg-surface flex items-center">
      {/* Soft Background Decor */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full opacity-30" style={{ backgroundImage: 'radial-gradient(circle at 10% 20%, var(--color-surface-variant) 0%, transparent 60%)' }} />
      </div>
      
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-8">
          
          {/* Left Content Area */}
          <div className="flex-1 text-center lg:text-left pt-10">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-8 text-5xl sm:text-6xl lg:text-[5.5rem] font-black tracking-tight leading-[1.05]"
              style={{ color: 'var(--color-on-surface)' }}
            >
              Invest in <br />
              <span className="text-on-surface">Skilled Trades.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mb-10 max-w-lg text-lg md:text-xl font-medium mx-auto lg:mx-0 leading-relaxed"
              style={{ color: 'var(--color-on-surface-variant)' }}
            >
              BuildBridge connects verified Nigerian tradespeople with the capital they need to buy tools, scale businesses, and build our collective future.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 mb-16 justify-center lg:justify-start"
            >
              <Link href="/browse" className="cursor-pointer">
                <button 
                  className="w-full sm:w-auto h-14 px-8 rounded-full font-bold text-lg shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2"
                  style={{ background: 'var(--color-primary)', color: 'var(--color-on-primary)' }}
                >
                  Browse Needs
                </button>
              </Link>
              <Link href="/onboarding" className="cursor-pointer">
                <button 
                  className="w-full sm:w-auto h-14 px-8 rounded-full font-bold text-lg transition-all border-2 flex items-center justify-center gap-2 hover:bg-surface-variant/50"
                  style={{ borderColor: 'var(--color-outline-variant)', color: 'var(--color-on-surface)' }}
                >
                  Join as Artisan
                </button>
              </Link>
            </motion.div>

            {/* Stats Row */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex items-center gap-8 justify-center lg:justify-start"
            >
              <div className="flex flex-col">
                <div className="text-3xl font-black text-on-surface">
                   ₦<CountUp end={stats.totalFunded} separator="," formattingFn={(val) => `${(val/1000000).toFixed(1)}M`} />
                </div>
                <div className="text-sm font-semibold text-on-surface-variant">Capital Deployed</div>
              </div>
              
              <div className="w-[2px] h-10 bg-outline-variant" />
              
              <div className="flex flex-col">
                <div className="text-3xl font-black text-on-surface">
                   <CountUp end={stats.totalTradespeople} separator="," />+
                </div>
                <div className="text-sm font-semibold text-on-surface-variant">Tradespeople</div>
              </div>
              
              <div className="w-[2px] h-10 bg-outline-variant hidden sm:block" />

              <div className="hidden sm:flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 text-primary">
                 <ArrowUpRight className="h-6 w-6" />
              </div>
            </motion.div>
          </div>

          {/* Right Collage Area */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex-1 w-full relative h-[500px] sm:h-[650px] lg:h-[700px] mt-10 lg:mt-0"
          >
            {/* Top Right Box (Tailor) */}
            <motion.div 
               animate={{ y: [-5, 5, -5] }}
               transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
               className="absolute top-0 right-[25%] lg:right-[30%] w-[50%] h-[55%] rounded-[2rem] lg:rounded-[3rem] overflow-hidden shadow-2xl z-20 border-4 border-surface"
            >
               <img src="/images/hero/tailor.png" alt="Tailor" className="w-full h-full object-cover" />
            </motion.div>

            {/* Middle Right Box (Carpenter) */}
            <motion.div 
               animate={{ y: [5, -5, 5] }}
               transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
               className="absolute top-[20%] lg:top-[15%] right-0 w-[40%] h-[50%] rounded-[2rem] lg:rounded-[3rem] overflow-hidden shadow-xl z-10 border-4 border-surface"
            >
               <img src="/images/hero/carpenter.png" alt="Carpenter" className="w-full h-full object-cover" />
            </motion.div>

            {/* Bottom Left Box (Baker) */}
            <motion.div 
               animate={{ y: [-3, 3, -3] }}
               transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 2 }}
               className="absolute bottom-0 left-[10%] lg:left-0 w-[55%] h-[45%] rounded-[2rem] lg:rounded-[3rem] overflow-hidden shadow-2xl z-30 border-4 border-surface flex"
            >
               <img src="/images/hero/baker.png" alt="Baker" className="w-full h-full object-cover" />
               
               {/* Decorative Element on Baker */}
               <div className="absolute top-4 right-4 bg-surface/50 backdrop-blur-md rounded-2xl p-2 border border-surface/50 text-on-surface shadow-sm">
                  <div className="flex items-center gap-1 text-sm font-bold opacity-80 border border-current rounded-full px-2 py-0.5">
                     <span className="w-3 h-3 rounded-full border border-current opacity-60" />
                     <span className="w-3 h-3 rounded-full border border-current opacity-80 -ml-1.5" />
                     <span className="w-3 h-3 rounded-full border border-current -ml-1.5" />
                  </div>
               </div>
            </motion.div>

            {/* Floating Sparkle Elements */}
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute top-[5%] left-[15%] text-badge-3 opacity-60"
            >
               <Sparkles className="w-8 h-8" />
            </motion.div>
            
            <motion.div 
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute bottom-[20%] right-[10%] w-6 h-6 rounded-full bg-primary opacity-40"
            />
            
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-[45%] left-0 w-4 h-4 rounded-full bg-badge-1 opacity-50"
            />

          </motion.div>
        </div>
      </div>
    </section>
  )
}