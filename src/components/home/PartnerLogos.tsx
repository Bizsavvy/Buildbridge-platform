"use client"

import * as React from "react"
import { motion } from "framer-motion"

const partners = [
  "Paystack",
  "Supabase", 
  "Flutterwave",
  "Interswitch",
  "Andela",
  "Termii"
]

export function PartnerLogos() {
  return (
    <section className="py-12 border-y" style={{ background: 'var(--color-surface-container-low)', borderColor: 'var(--color-outline-variant)' }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="text-center text-sm font-semibold uppercase tracking-[0.2em] mb-10" style={{ color: 'var(--color-on-surface-variant)' }}>
          Trusted Infrastructure
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-8 md:justify-between">
          {partners.map((partner, index) => (
            <motion.div
              key={partner}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="flex items-center justify-center transition-all duration-300 cursor-pointer"
            >
              <span className="text-2xl font-bold tracking-tighter" style={{ color: 'var(--color-on-surface)', opacity: 0.4 }}>
                {partner}.
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}