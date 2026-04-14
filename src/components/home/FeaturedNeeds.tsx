"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { NeedCard } from "@/components/ui/NeedCard"
import { EmptyState } from "@/components/ui/EmptyState"
import { Button } from "@/components/ui/Button"
import Link from "next/link"
import { type Need, type Profile } from "@/types"
import { Search, ArrowRight } from "lucide-react"

interface FeaturedNeedsProps {
  needs: (Need & { profile?: Profile & { name: string } })[];
  isLoading?: boolean;
}

export function FeaturedNeeds({ needs, isLoading = false }: FeaturedNeedsProps) {
  if (!isLoading && needs.length === 0) {
    return (
      <section className="py-24 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <EmptyState
            icon={Search}
            title="Ready to grow your trade?"
            description="Our community is currently processing new verification requests. Check back soon or browse other active needs."
            actionLabel="View All Needs"
            onAction={() => window.location.href = "/browse"}
          />
        </div>
      </section>
    )
  }

  return (
    <section className="py-24 bg-slate-50 relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
      </div>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
        <div className="mb-16 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div className="flex flex-col gap-3">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="w-12 h-1 bg-primary rounded-full"
            />
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
              Urgent Needs
            </h2>
            <p className="text-lg text-slate-600 max-w-xl">
              These skilled professionals are close to reaching their goals. Small pledges can make a massive difference.
            </p>
          </div>
          <Link href="/browse" className="cursor-pointer">
            <Button variant="ghost" className="text-primary font-semibold flex items-center gap-2 hover:bg-primary/5 px-6 rounded-full">
              View all 200+ active needs
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {needs.map((need, index) => (
            <motion.div
              key={need.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <NeedCard need={need} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}