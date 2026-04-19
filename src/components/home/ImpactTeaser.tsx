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
    caption: "The industrial welding machine I received through BuildBridge allowed me to take on high-rise construction contracts.",
    image: "/images/hero/carpenter.png",
  },
  {
    id: "2",
    name: "Amina S.",
    trade: "Tailor",
    location: "Lagos",
    caption: "Before BuildBridge, I was renting my equipment. Now I own my shop and three professional machines.",
    image: "/images/hero/tailor.png",
  },
  {
    id: "3",
    name: "Chidi O.",
    trade: "Carpenter",
    location: "Enugu",
    caption: "The electric planer changed everything for my workshop. Faster delivery times meant more clients.",
    image: "/images/hero/baker.png",
  }
]

export function ImpactTeaser() {
  return (
    <section className="py-24 bg-white overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-black uppercase tracking-widest mb-6">
            Success Stories
          </span>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight text-on-surface mb-6 leading-tight">
            Our <span className="text-primary italic">Impact</span> Stories
          </h2>
          <p className="text-lg text-on-surface-variant font-medium">
            Real proofs of growth from the artisans you've supported. Every pledge closes a loop of hope.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {stories.slice(0, 2).map((story, index) => (
            <motion.div
              key={story.id}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="group relative h-[500px] rounded-[3rem] overflow-hidden shadow-2xl cursor-pointer"
            >
              <img 
                src={story.image} 
                alt={story.name} 
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
              />
              {/* Overlay Content */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-10">
                <div className="mb-6">
                  <Badge level={4} className="mb-4">Verified Impact</Badge>
                  <h3 className="text-3xl font-black text-white mb-4 leading-tight">
                    Helping {story.name}'s workshop in {story.location}
                  </h3>
                  <p className="text-white/80 text-lg font-medium line-clamp-2 italic mb-8">
                    &ldquo;{story.caption}&rdquo;
                  </p>
                </div>
                
                <div className="flex items-center justify-between pt-6 border-t border-white/20">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full border-2 border-white overflow-hidden bg-white/20 flex items-center justify-center">
                        <span className="text-white font-black text-sm">{story.name.charAt(0)}</span>
                      </div>
                      <span className="text-white font-bold text-sm tracking-wide uppercase">Read Full Story</span>
                   </div>
                   <div className="w-12 h-12 rounded-full bg-yellow-400 flex items-center justify-center text-black shadow-xl shadow-yellow-400/20">
                      <ArrowRight className="h-6 w-6" />
                   </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <Link href="/impact" className="h-14 px-10 rounded-full border-2 border-outline-variant text-on-surface font-black text-sm hover:bg-surface-variant/30 transition-all flex items-center gap-2 mx-auto">
              View All Stories on Impact Wall
              <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </section>
  )
}