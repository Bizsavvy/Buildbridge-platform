"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { CheckCircle2, ArrowRight } from "lucide-react"
import Link from "next/link"

const sections = [
  {
    tag: "Maximizing Impact",
    title: "Foster Generosity, Build Real Futures",
    desc: "Every pledge on BuildBridge is tied to a specific piece of equipment. You aren't just giving money; you're buying a tailor's sewing machine or a welder's transformer.",
    features: [
      "No management fees on direct pledges",
      "100% of capital reaches the tradesperson",
      "Real-time funding progress tracking"
    ],
    image: "/images/hero/tailor.png",
    imageFirst: true
  },
  {
    tag: "Verified At Each Step",
    title: "Elevate Giving, Transform Whole Lives",
    desc: "Our multi-layered verification process ensures your support goes to real, hard-working artisans who have been vouched for by their communities.",
    features: [
      "Biometric and Govt ID verification",
      "Community leader endorsement system",
      "Proof-of-trade physical verification"
    ],
    image: "/images/hero/carpenter.png",
    imageFirst: false
  }
]

export function ImpactHighlights() {
  return (
    <section className="py-24 bg-surface-container-lowest overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {sections.map((section, idx) => (
          <div 
            key={idx} 
            className={`flex flex-col lg:flex-row items-center gap-16 mb-24 last:mb-0 ${section.imageFirst ? '' : 'lg:flex-row-reverse'}`}
          >
            {/* Image Column */}
            <motion.div 
              initial={{ opacity: 0, x: section.imageFirst ? -40 : 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="flex-1 w-full"
            >
              <div className="relative group">
                <div className="absolute inset-0 bg-primary/10 rounded-[3rem] translate-x-4 translate-y-4 -z-10 transition-transform group-hover:translate-x-6 group-hover:translate-y-6" />
                <div className="aspect-[4/3] rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white relative w-full h-full block">
                  <img 
                    src={section.image} 
                    alt={section.title} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                  />
                </div>
                {/* Floating Badge */}
                <div className={`absolute ${section.imageFirst ? 'md:-right-4 lg:-right-6' : 'md:-left-4 lg:-left-6'} top-1/4 bg-white p-6 rounded-3xl shadow-2xl hidden md:block border border-outline-variant/30`}>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center text-green-600">
                      <CheckCircle2 className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm font-black text-on-surface">Verified</p>
                      <p className="text-xs font-bold text-on-surface-variant">100% Trust Score</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Content Column */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex-1 w-full text-left"
            >
              <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-black uppercase tracking-widest mb-6">
                {section.tag}
              </span>
              <h2 className="text-3xl md:text-5xl font-black tracking-tight text-on-surface mb-8 leading-[1.1]">
                {section.title.split(' ').map((word, i) => (
                  <span key={i} className={i % 3 === 2 ? 'text-primary' : ''}>
                    {word}{' '}
                  </span>
                ))}
              </h2>
              <p className="text-lg text-on-surface-variant font-medium leading-relaxed mb-10">
                {section.desc}
              </p>
              
              <ul className="space-y-4 mb-12">
                {section.features.map((feat, i) => (
                  <li key={i} className="flex items-center gap-4 text-on-surface font-bold">
                    <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0" />
                    {feat}
                  </li>
                ))}
              </ul>

              <div className="flex flex-col sm:flex-row gap-6">
                 <Link href="/how-it-works" className="h-12 px-8 rounded-full border-2 border-outline-variant text-on-surface font-black text-sm hover:bg-surface-variant/30 transition-all flex items-center gap-2">
                    Learn More
                    <ArrowRight className="h-4 w-4" />
                 </Link>
              </div>
            </motion.div>
          </div>
        ))}
      </div>
    </section>
  )
}
