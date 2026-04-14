"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { ImpactCard } from "./ImpactCard"
import { type ImpactWallSubmission, type Profile } from "@/types"

interface ImpactGridProps {
  submissions: (ImpactWallSubmission & { profile: Profile })[]
}

export function ImpactGrid({ submissions }: ImpactGridProps) {
  if (submissions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
        <p className="text-display-small font-black text-on-surface-variant opacity-20 italic">
          The wall of success is being built...
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {submissions.map((submission, index) => (
        <motion.div
          key={submission.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <ImpactCard submission={submission} />
        </motion.div>
      ))}
    </div>
  )
}
