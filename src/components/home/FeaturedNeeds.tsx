"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { NeedCard } from "@/components/ui/NeedCard"
import { EmptyState } from "@/components/ui/EmptyState"
import { type Need } from "@/types"
import { Search } from "lucide-react"

interface FeaturedNeedsProps {
  needs: (Need & { profile?: { name: string; location_lga: string; location_state: string } })[];
  isLoading?: boolean;
}

export function FeaturedNeeds({ needs, isLoading = false }: FeaturedNeedsProps) {
  if (!isLoading && needs.length === 0) {
    return (
      <section className="py-20 bg-surface">
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
    <section className="py-20 bg-surface">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
          <div className="flex flex-col gap-2">
            <h2 className="text-display-small font-black text-on-surface">
              Urgent Needs
            </h2>
            <p className="text-body-large text-on-surface-variant max-w-xl">
              These skilled professionals are close to reaching their goals. Small pledges can make a massive difference.
            </p>
          </div>
          <button 
            onClick={() => window.location.href = "/browse"}
            className="text-label-large font-bold text-primary hover:underline"
          >
            View all 200+ active needs
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {needs.map((need, index) => (
            <motion.div
              key={need.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <NeedCard need={need} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
