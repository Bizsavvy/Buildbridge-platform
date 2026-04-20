"use client"

import * as React from "react"
import { motion } from "framer-motion"
import CountUp from "react-countup"
import { Skeleton } from "@/components/ui/Skeleton"

interface StatsProps {
  stats: {
    totalFunded: number;
    totalTradespeople: number;
  };
  isLoading?: boolean;
}

export function Stats({ stats, isLoading = false }: StatsProps) {
  if (!stats || (stats.totalFunded === 0 && stats.totalTradespeople === 0)) {
    return null;
  }

  return (
    <section className="py-16 md:py-24 bg-white border-y border-outline-variant/30 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
         <motion.div
           initial={{ opacity: 0, y: 20 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
           transition={{ duration: 0.6 }}
           className="w-full max-w-3xl mx-auto flex flex-col sm:flex-row justify-center sm:justify-around items-center gap-12 md:gap-24"
         >
           {isLoading ? (
             <>
               <div className="flex flex-col items-center text-center">
                 <Skeleton className="h-12 w-32 mb-2" />
                 <Skeleton className="h-4 w-24" />
               </div>
               <div className="flex flex-col items-center text-center">
                 <Skeleton className="h-12 w-32 mb-2" />
                 <Skeleton className="h-4 w-24" />
               </div>
             </>
           ) : (
             <>
               <div className="flex flex-col items-center text-center">
                 <div className="text-5xl md:text-6xl font-black text-primary">
                    ₦<CountUp
                      start={0}
                      end={stats.totalFunded / 100}
                      duration={2.5}
                      separator=","
                      suffix=""
                      enableScrollSpy
                      scrollSpyOnce
                    />
                  </div>
                 <div className="text-sm font-bold uppercase tracking-widest text-on-surface-variant mt-3">
                   Total Funded
                 </div>
               </div>
               {/* Vertical Divider for Desktop, Horizontal for Mobile */}
               <div className="w-24 h-px sm:w-px sm:h-24 bg-outline-variant/50" />
               <div className="flex flex-col items-center text-center">
                 <div className="text-5xl md:text-6xl font-black text-primary">
                    <CountUp
                      start={0}
                      end={stats.totalTradespeople}
                      duration={2.5}
                      separator=","
                      enableScrollSpy
                      scrollSpyOnce
                    />
                  </div>
                 <div className="text-sm font-bold uppercase tracking-widest text-on-surface-variant mt-3">
                   Tradespeople Backed
                 </div>
               </div>
             </>
           )}
         </motion.div>
      </div>
    </section>
  )
}
