"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Search, HeartHandshake, Rocket } from "lucide-react"

const steps = [
  {
    icon: Search,
    title: "Discover Skills",
    description: "Browse verified tradespeople in your community—from tailors to welders—and read their growth stories.",
    color: "bg-badge-1/10 text-badge-1",
  },
  {
    icon: HeartHandshake,
    title: "Make a Pledge",
    description: "Contribute any amount toward their specific need. Your money stays in escrow until the goal is fully met.",
    color: "bg-badge-2/10 text-badge-2",
  },
  {
    icon: Rocket,
    title: "See the Impact",
    description: "Once funded, capital is deployed. You receive a direct proof-of-use update showing how your investment helped.",
    color: "bg-badge-4/10 text-badge-4",
  },
]

export function HowItWorks() {
  return (
    <section className="py-24 bg-surface-variant/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-display-small font-black text-on-surface mb-4">
            How BuildBridge Works
          </h2>
          <p className="text-body-large text-on-surface-variant max-w-2xl mx-auto">
            We’ve removed the barriers to capital for African tradespeople. It’s transparent, direct, and focused on growth.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
          {/* Connector Line (Desktop) */}
          <div className="hidden md:block absolute top-[44px] left-[15%] right-[15%] h-[2px] bg-outline-variant/50 -z-10" />

          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              className="flex flex-col items-center text-center group"
            >
              <div className={`w-20 h-20 rounded-3xl ${step.color} flex items-center justify-center mb-6 shadow-sm border border-outline-variant transition-transform duration-300 group-hover:scale-110`}>
                <step.icon className="h-10 w-10" />
              </div>
              <h3 className="text-headline-small font-black text-on-surface mb-3">
                {step.title}
              </h3>
              <p className="text-body-large text-on-surface-variant">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
