"use client"

import * as React from "react"
import { motion } from "framer-motion"

const partners = [
  "Paystack",
  "Supabase",
  "Andela",
  "Flutterwave",
  "Termii",
  "Interswitch"
]

export function PartnerLogos() {
  return (
    <section className="py-12 border-y border-slate-200 bg-slate-50/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="text-center text-sm font-semibold text-slate-500 uppercase tracking-[0.2em] mb-10">
          Trusted Partners & Infrastructure
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-8 md:justify-between">
          {partners.map((partner, index) => (
            <motion.div
              key={partner}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="flex items-center justify-center grayscale opacity-50 transition-all duration-300 hover:grayscale-0 hover:opacity-100 cursor-pointer"
            >
              <span className="text-2xl font-bold text-slate-400 tracking-tighter">
                {partner}.
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}