"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { ShieldCheck, Zap, HeartHandshake, Eye, Users, Lock } from "lucide-react"

const values = [
  {
    icon: ShieldCheck,
    title: "Verified Trades",
    desc: "Every artisan goes through multi-step identity and trade verification.",
    color: "bg-[#7C3AED]", // Branding Purple
    iconColor: "text-white"
  },
  {
    icon: Zap,
    title: "Direct Support",
    desc: "Capital goes directly to equipment purchase, zero middlemen involved.",
    color: "bg-yellow-400",
    iconColor: "text-white"
  },
  {
    icon: HeartHandshake,
    title: "Zero Interest",
    desc: "This isn't a loan. It's community support for growth with zero debt.",
    color: "bg-blue-500",
    iconColor: "text-white"
  },
  {
    icon: Eye,
    title: "Total Transparency",
    desc: "Get real-time updates and proof-of-use photos for every kobo funded.",
    color: "bg-[#7C3AED]/15", // Soft Purple
    iconColor: "text-white",
    border: "border-primary/20",
    darkText: true
  },
  {
    icon: Users,
    title: "Community Vouched",
    desc: "Tradespeople are vouched for by local leaders and past customers.",
    color: "bg-green-500",
    iconColor: "text-white"
  },
  {
    icon: Lock,
    title: "Secure Escrow",
    desc: "Payments are held securely using Paystack until funding is complete.",
    color: "bg-slate-900",
    iconColor: "text-white"
  }
]

export function CoreValues() {
  return (
    <section className="py-24 bg-white relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-black tracking-tight text-on-surface mb-6">
            Why You Should Choose <span className="text-primary italic underline decoration-yellow-400">BuildBridge?</span>
          </h2>
          <p className="text-lg text-on-surface-variant font-medium">
            We've built a trust-first ecosystem designed to maximize the impact of every support gesture.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {values.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`p-8 rounded-[2rem] flex flex-col gap-6 transition-transform hover:-translate-y-1 hover:shadow-xl ${item.color} ${item.border || ''} ${item.darkText ? 'text-on-surface' : 'text-white'}`}
            >
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${item.darkText ? 'bg-primary/10' : 'bg-white/20'}`}>
                <item.icon className={`h-7 w-7 ${item.iconColor ? item.iconColor : (item.darkText ? 'text-primary' : 'text-white')}`} />
              </div>
              <div>
                <h3 className={`text-xl font-black mb-3 ${item.darkText ? 'text-on-surface' : 'text-white'}`}>
                  {item.title}
                </h3>
                <p className={`text-base font-medium opacity-80 ${item.darkText ? 'text-on-surface-variant' : 'text-white/90'}`}>
                  {item.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
