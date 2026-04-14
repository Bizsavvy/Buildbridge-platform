"use client"

import * as React from "react"
import { useEffect } from "react"
import { motion } from "framer-motion"
import confetti from "canvas-confetti"
import { Button } from "@/components/ui/Button"
import { CheckCircle2, Heart, Share2, ArrowRight } from "lucide-react"
import Link from "next/link"

interface PledgeSuccessProps {
  amount: number
  tradespersonName: string
  needId: string
}

export function PledgeSuccess({ amount, tradespersonName, needId }: PledgeSuccessProps) {
  useEffect(() => {
    // Confetti explosion
    const duration = 2 * 1000
    const animationEnd = Date.now() + duration
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 }

    const randomInRange = (min: number, max: number) => {
      return Math.random() * (max - min) + min
    }

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now()

      if (timeLeft <= 0) {
        return clearInterval(interval)
      }

      const particleCount = 50 * (timeLeft / duration)
      // Since particles fall down, start a bit higher than random
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } })
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } })
    }, 250)

    return () => clearInterval(interval)
  }, [])

  const formattedAmount = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount / 100)

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-12 px-6 text-center gap-8 bg-surface-variant/20 rounded-3xl border border-badge-2/20 backdrop-blur-xl"
    >
      <div className="relative">
        <div className="h-24 w-24 rounded-full bg-badge-2 flex items-center justify-center shadow-lg shadow-badge-2/30">
          <CheckCircle2 className="h-12 w-12 text-white" />
        </div>
        <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-md"
        >
            <Heart className="h-4 w-4 fill-on-primary" />
        </motion.div>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-display-small font-black text-on-surface leading-tight">
          Pledge <span className="text-badge-2">Confirmed!</span>
        </h2>
        <p className="text-body-large text-on-surface-variant max-w-sm mx-auto">
          You've just pledged <span className="text-on-surface font-black">{formattedAmount}</span> to back <span className="text-on-surface font-black">{tradespersonName}</span>!
        </p>
      </div>

      {/* Trust & Escrow Confirmation */}
      <div className="p-4 bg-surface rounded-2xl border border-outline-variant/50 max-w-xs w-full shadow-sm">
         <p className="text-label-small uppercase font-black text-on-surface-variant tracking-widest mb-1">Escrow Status</p>
         <p className="text-body-small text-on-surface-variant italic">
            "Your funds are held in escrow. {tradespersonName} will only receive them once they prove the item was purchased."
         </p>
      </div>

      <div className="flex flex-col gap-4 w-full pt-4">
        <Button onClick={() => {}} className="w-full gap-2 h-14 text-headline-small shadow-sm" variant="secondary">
          <Share2 className="h-5 w-5" />
          Share the Impact
        </Button>
        <Link href="/browse" className="w-full">
           <Button className="w-full gap-2 h-14 text-headline-small shadow-lg">
              Support Someone Else <ArrowRight className="h-5 w-5" />
           </Button>
        </Link>
      </div>

      <p className="text-label-small text-on-surface-variant opacity-60">
        BuildBridge: Pockets of trust building communities.
      </p>
    </motion.div>
  )
}
