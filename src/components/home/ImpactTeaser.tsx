"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/Card"
import { Avatar } from "@/components/ui/Avatar"
import { Badge } from "@/components/ui/Badge"
import { ArrowRight, Quote } from "lucide-react"
import Link from "next/link"

const stories = [
  {
    id: "1",
    name: "Ibrahim K.",
    trade: "Welder",
    location: "Kano",
    caption: "The industrial welding machine I received through BuildBridge allowed me to take on high-rise construction contracts. I have since hired two apprentices.",
    image: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&q=80&w=400",
  },
  {
    id: "2",
    name: "Amina S.",
    trade: "Tailor",
    location: "Lagos",
    caption: "Before BuildBridge, I was renting my equipment. Now I own my shop and three professional machines. My income has tripled.",
    image: "https://images.unsplash.com/photo-1558223932-901848bc4e92?auto=format&fit=crop&q=80&w=400",
  },
  {
    id: "3",
    name: "Chidi O.",
    trade: "Carpenter",
    location: "Enugu",
    caption: "The electric planer changed everything for my workshop. Faster delivery times meant more clients. The community trust system truly works.",
    image: "https://images.unsplash.com/photo-1536412597336-ade7b523ec3f?auto=format&fit=crop&q=80&w=400",
  }
]

export function ImpactTeaser() {
  return (
    <section className="py-24 overflow-hidden" style={{ background: 'var(--color-surface-container-low)' }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div className="max-w-2xl">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4" style={{ color: 'var(--color-on-surface)' }}>
              Real Work, Real Impact
            </h2>
            <p className="text-lg" style={{ color: 'var(--color-on-surface-variant)' }}>
              See the direct results of your investment. Proof-of-use updates close every funding loop.
            </p>
          </div>
          <Link href="/impact" className="text-base font-semibold flex items-center group cursor-pointer" style={{ color: 'var(--color-primary)' }}>
            Explore Impact Wall
            <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {stories.map((story, index) => (
            <motion.div
              key={story.id}
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="h-full flex flex-col p-6 relative overflow-hidden group cursor-pointer">
                <Quote 
                  className="absolute -top-4 -right-4 h-24 w-24 -rotate-12 transition-transform group-hover:rotate-0" 
                  style={{ color: 'var(--color-primary)', opacity: 0.1 }} 
                />
                
                <div className="flex items-center gap-4 mb-6 relative z-10">
                  <Avatar name={story.name} size="md" className="border-2" style={{ borderColor: 'var(--color-primary)' }} />
                  <div className="flex flex-col">
                    <h4 className="text-base font-bold" style={{ color: 'var(--color-on-surface)' }}>{story.name}</h4>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium" style={{ color: 'var(--color-on-surface-variant)' }}>{story.trade}</span>
                      <span className="h-1 w-1 rounded-full" style={{ background: 'var(--color-outline)' }} />
                      <span className="text-sm" style={{ color: 'var(--color-on-surface-variant)' }}>{story.location}</span>
                    </div>
                  </div>
                </div>

                <p className="text-base flex-grow italic relative z-10" style={{ color: 'var(--color-on-surface)' }}>
                  &ldquo;{story.caption}&rdquo;
                </p>

                <div className="mt-8 pt-6 border-t relative z-10 flex justify-between items-center" style={{ borderColor: 'var(--color-outline-variant)' }}>
                   <Badge level={4}>Funded</Badge>
                   <span className="text-sm" style={{ color: 'var(--color-on-surface-variant)' }}>March 2026</span>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}