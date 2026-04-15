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
        {/* Floating Community Avatars (Decorative) */}
        <div className="absolute inset-0 pointer-events-none hidden lg:block">
          {[
             { top: '15%', left: '10%', delay: 0, url: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&q=80&w=100' },
             { top: '25%', left: '22%', delay: 0.2, url: 'https://images.unsplash.com/photo-1522529599102-193c0d76b5b6?auto=format&fit=crop&q=80&w=100' },
             { top: '10%', right: '15%', delay: 0.4, url: 'https://images.unsplash.com/photo-1507152832244-10d45c7eda57?auto=format&fit=crop&q=80&w=100' },
             { top: '35%', right: '8%', delay: 0.6, url: 'https://images.unsplash.com/photo-1491333078588-55b457f210c1?auto=format&fit=crop&q=80&w=100' },
             { bottom: '20%', left: '12%', delay: 0.8, url: 'https://images.unsplash.com/photo-1567532939604-b6c5b0ad2e01?auto=format&fit=crop&q=80&w=100' },
             { bottom: '30%', right: '18%', delay: 1.0, url: 'https://images.unsplash.com/photo-1506272517162-4aa6a491d95d?auto=format&fit=crop&q=80&w=100' },
          ].map((pos, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1, y: [0, -10, 0] }}
              transition={{ 
                scale: { duration: 0.5, delay: pos.delay },
                opacity: { duration: 0.5, delay: pos.delay },
                y: { duration: 4, repeat: Infinity, ease: "easeInOut", delay: pos.delay }
              }}
              className="absolute w-12 h-12 rounded-full border-2 border-white shadow-xl overflow-hidden bg-surface-variant flex items-center justify-center"
              style={{ top: pos.top, left: pos.left, right: pos.right, bottom: pos.bottom }}
            >
              <Link href="/browse" className="cursor-pointer">
                <button 
                  className="w-full sm:w-auto h-14 px-8 rounded-full font-bold text-lg shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2"
                  style={{ background: 'var(--color-primary)', color: 'var(--color-on-primary)' }}
                >
                  Browse Needs
                </button>
              </Link>
              <Link href="/register" className="cursor-pointer">
                <button 
                  className="w-full sm:w-auto h-14 px-8 rounded-full font-bold text-lg transition-all border-2 flex items-center justify-center gap-2 hover:bg-surface-variant/50"
                  style={{ borderColor: 'var(--color-outline-variant)', color: 'var(--color-on-surface)' }}
                >
                  Join as Artisan
                </button>
              </Link>
              <img 
                src={pos.url} 
                alt="Community member" 
                className="w-full h-full object-cover filter brightness-[1.05]" 
              />
            </motion.div>
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
            From tailors to mechanics—your capital build lives and legacies.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Link href="/browse" className="w-full sm:w-auto">
              <button 
                className="w-full h-14 px-10 rounded-full font-black text-lg bg-primary text-on-primary shadow-2xl shadow-primary/30 hover:shadow-primary/40 transition-all hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2"
              >
                Start Supporting
              </button>
            </Link>
            <Link href="/impact" className="w-full sm:w-auto">
              <button 
                className="w-full h-14 px-10 rounded-full font-black text-lg border-2 border-outline-variant text-on-surface hover:bg-surface-variant/30 transition-all flex items-center justify-center gap-2"
              >
                See the Impact
              </button>
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
              className="group relative h-80 rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white cursor-pointer"
            >
              <img 
                src={`/images/hero/${item.img}.png`} 
                alt={item.label} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
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