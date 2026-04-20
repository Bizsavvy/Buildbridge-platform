"use client"

import * as React from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"

export function FinalCTA() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-primary relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-yellow-400" />
      <div className="mx-auto max-w-7xl">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative overflow-hidden rounded-[2.5rem] bg-white p-12 md:p-20 text-center shadow-2xl"
          style={{ 
            boxShadow: '0 30px 60px -12px rgba(0,0,0,0.25)'
          }}
        >
          <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center gap-6">
            <h2 className="text-3xl md:text-5xl font-black leading-tight tracking-tight text-primary">
              Empower a Craftsman,<br className="hidden md:block" /> 
              Build a Future.
            </h2>
            
            <p className="text-base md:text-lg text-primary/70 max-w-xl font-medium leading-relaxed">
              Join thousands of backers supporting Nigerian tradespeople. Whether you&apos;re at home or in the diaspora, your capital makes growth possible.
            </p>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="mt-4"
            >
              <Link 
                href="/browse" 
                className="inline-flex items-center justify-center gap-2 bg-primary text-white px-8 py-3.5 rounded-full text-base font-black tracking-wide shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Browse Active Needs
                <ArrowRight className="h-4 w-4" />
              </Link>
            </motion.div>
          </div>
          
          {/* Subtle decorative background circles */}
          <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
        </motion.div>
      </div>
    </section>
  )
}