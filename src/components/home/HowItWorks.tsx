"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Search, HeartHandshake, Rocket } from "lucide-react"

const steps = [
  {
    icon: Search,
    title: "Create Your Need",
    description: "List the specific tool or material you need. Name it exactly—every detail matters.",
  },
  {
    icon: HeartHandshake,
    title: "Community Backs You",
    description: "Family, friends, and strangers pledge what they can. All pledges stay in escrow until met.",
  },
  {
    icon: Rocket,
    title: "Funds Arrive (48hrs)",
    description: "Once funded, money goes straight to you. Share proof-of-use to close the loop.",
  },
]

export function HowItWorks() {
  return (
    <section className="py-24 relative overflow-hidden" style={{ background: 'var(--color-surface)' }}>
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-64 h-64 rounded-full opacity-[0.05]" style={{ background: 'var(--color-primary)', filter: 'blur(80px)' }} />
      <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full opacity-[0.05]" style={{ background: 'var(--color-tertiary)', filter: 'blur(80px)' }} />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-block px-4 py-1.5 rounded-full text-sm font-semibold uppercase tracking-widest mb-4"
            style={{ background: 'var(--color-primary-container)', color: 'var(--color-on-primary-container)' }}
          >
            How It Works
          </motion.div>
          <h2 className="text-3xl md:text-4xl font-extrabold mb-6" style={{ color: 'var(--color-on-surface)' }}>
            Simple. Direct. Trusted.
          </h2>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--color-on-surface-variant)' }}>
            We&apos;ve removed the barriers to capital for Nigerian tradespeople. Here&apos;s how the investment works.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 relative">
          <div className="hidden md:block absolute top-[100px] left-[15%] right-[15%] h-[2px] -z-10" style={{ background: 'var(--color-outline-variant)' }} />

          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="group"
            >
              <div 
                className="p-8 rounded-[2rem] h-full flex flex-col items-center text-center transition-all duration-300 hover:-translate-y-1"
                style={{ background: 'var(--color-surface-container)', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}
              >
                <div 
                  className="w-20 h-20 rounded-3xl flex items-center justify-center mb-8 transition-transform duration-500 group-hover:rotate-6"
                  style={{ background: 'var(--color-primary-container)', color: 'var(--color-on-primary-container)' }}
                >
                  <step.icon className="h-10 w-10" />
                </div>
                
                <div className="flex items-center gap-3 mb-4">
                  <span 
                    className="flex items-center justify-center w-6 h-6 rounded-full text-sm font-bold"
                    style={{ background: 'var(--color-primary)', color: 'var(--color-on-primary)' }}
                  >
                    {index + 1}
                  </span>
                  <h3 className="text-xl font-bold" style={{ color: 'var(--color-on-surface)' }}>
                    {step.title}
                  </h3>
                </div>

                <p className="leading-relaxed" style={{ color: 'var(--color-on-surface-variant)' }}>
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}