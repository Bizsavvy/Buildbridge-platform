"use client"

import * as React from "react"
import { motion } from "framer-motion"

// Using text-based logos for precision and token alignment
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
    <section className="py-12 border-y border-outline-variant bg-surface/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="text-center text-label-small font-bold text-on-surface-variant uppercase tracking-[0.2em] mb-10">
          Trusted Partners & Infrastucture
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-8 md:justify-between">
          {partners.map((partner, index) => (
            <motion.div
              key={partner}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="flex items-center justify-center grayscale opacity-60 transition-all duration-300 hover:grayscale-0 hover:opacity-100"
            >
              <span className="text-display-small font-black text-on-surface/80 tracking-tighter">
                {partner}.
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
