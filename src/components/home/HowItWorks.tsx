"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Search, HeartHandshake, Rocket } from "lucide-react"

const steps = [
  {
    icon: Search,
    title: "Discover Skills",
    description: "Browse verified tradespeople in your community—from tailors to welders—and read their growth stories.",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: HeartHandshake,
    title: "Make a Pledge",
    description: "Contribute any amount toward their specific need. Your money stays in escrow until the goal is fully met.",
    color: "bg-emerald-500/10 text-emerald-600",
  },
  {
    icon: Rocket,
    title: "See the Impact",
    description: "Once funded, capital is deployed. You receive a direct proof-of-use update showing how your investment helped.",
    color: "bg-purple-500/10 text-purple-600",
  },
]

export function HowItWorks() {
  return (
    <section className="py-24 bg-white relative overflow-hidden">
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl -z-10" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold uppercase tracking-widest mb-4"
          >
            The Ecosystem
          </motion.div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-6">
            How BuildBridge Works
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            We&apos;ve removed the barriers to capital for African tradespeople. It&apos;s transparent, direct, and focused on growth.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 relative">
          <div className="hidden md:block absolute top-[100px] left-[15%] right-[15%] h-[2px] bg-gradient-to-r from-transparent via-slate-200 to-transparent -z-10" />

          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="group"
            >
              <div className="glass-card-hover p-8 rounded-[2rem] h-full flex flex-col items-center text-center">
                <div className={`w-20 h-20 rounded-3xl ${step.color} flex items-center justify-center mb-8 shadow-inner border border-white/50 transition-transform duration-500 group-hover:rotate-6`}>
                  <step.icon className="h-10 w-10" />
                </div>
                
                <div className="flex items-center gap-3 mb-4">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-sm font-bold">
                    {index + 1}
                  </span>
                  <h3 className="text-xl font-bold text-slate-900">
                    {step.title}
                  </h3>
                </div>

                <p className="text-slate-600 leading-relaxed">
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