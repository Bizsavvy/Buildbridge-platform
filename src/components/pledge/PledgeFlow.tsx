"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Textarea } from "@/components/ui/Textarea"
import { Card } from "@/components/ui/Card"
import { 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle2, 
  MessageSquare, 
  Info,
  Zap,
  Lock,
  ArrowRight
} from "lucide-react"
import { cn } from "@/lib/utils"
import Script from "next/script"
import { PledgeSuccess } from "./PledgeSuccess"

interface PledgeFlowProps {
  needId: string
  needName: string
  tradespersonName: string
  goalAmount: number
}

const QUICK_AMOUNTS = [500, 1000, 2000, 5000]

export function PledgeFlow({ needId, needName, tradespersonName, goalAmount }: PledgeFlowProps) {
  const router = useRouter()
  const supabase = createClient()
  
  const [step, setStep] = useState(0) // 0: Selection, 1: Breakdown, 2: Message, 3: Success
  const [pledgeAmount, setPledgeAmount] = useState<number | null>(null)
  const [customAmount, setCustomAmount] = useState("")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [showFlow, setShowFlow] = useState(false)

  // Auth check
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    checkUser()
  }, [])

  const handleStartPledge = () => {
    if (!user) {
      router.push(`/login?redirectTo=/needs/${needId}`)
      return
    }
    setShowFlow(true)
  }

  const handleAmountSelect = (naira: number) => {
    setPledgeAmount(naira * 100)
    setStep(1)
  }

  const handleCustomSubmit = () => {
    const naira = parseInt(customAmount.replace(/[^0-9]/g, ""))
    if (naira > 0) {
      setPledgeAmount(naira * 100)
      setStep(1)
    }
  }

  // Fee Logic
  const amountKobo = pledgeAmount || 0
  const processingFeeKobo = Math.floor(amountKobo * 0.015) + (amountKobo > 250000 ? 10000 : 0)
  const platformFeeKobo = Math.floor(amountKobo * 0.05)
  const netToTradespersonKobo = amountKobo - processingFeeKobo - platformFeeKobo

  const formatNGN = (kobo: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 0,
    }).format(kobo / 100)
  }

  const handlePaystackPayment = () => {
    if (!(window as any).PaystackPop) {
      alert("Payment service is still loading. Please try again.")
      return
    }

    setLoading(true)

    const handler = (window as any).PaystackPop.setup({
      key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "pk_test_placeholder",
      email: user?.email || "anonymous@buildbridge.org",
      amount: amountKobo,
      currency: "NGN",
      metadata: {
        need_id: needId,
        backer_user_id: user?.id,
        custom_fields: [
          {
            display_name: "Need Name",
            variable_name: "need_name",
            value: needName
          },
          {
            display_name: "Tradesperson",
            variable_name: "tradesperson",
            value: tradespersonName
          }
        ]
      },
      callback: (response: any) => {
        setStep(3) // Move to success step
        setLoading(false)
      },
      onClose: () => {
        setLoading(false)
      }
    })

    handler.openIframe()
  }

  if (!showFlow) {
    return (
      <Button onClick={handleStartPledge} className="w-full text-headline-small py-8 rounded-2xl shadow-lg hover:scale-[1.02] transition-transform">
        Back This Tradesperson
      </Button>
    )
  }

  return (
    <>
      <Script src="https://js.paystack.co/v1/inline.js" strategy="lazyOnload" />
      
      <AnimatePresence mode="wait">
        {step === 3 ? (
          <PledgeSuccess 
            key="success" 
            amount={amountKobo} 
            tradespersonName={tradespersonName} 
            needId={needId}
          />
        ) : (
          <motion.div 
            key="flow"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col gap-6"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
               {step > 0 && (
                 <button onClick={() => setStep(step - 1)} className="text-label-large font-bold text-on-surface-variant hover:text-primary flex items-center gap-1">
                    <ChevronLeft className="h-4 w-4" />
                    Back
                 </button>
               )}
               <p className="text-label-small uppercase font-black text-primary tracking-widest text-right flex-grow">
                 Pledge {step + 1} of 3
               </p>
            </div>

            {/* Step Content */}
            {step === 0 && (
              <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-right-4">
                 <h2 className="text-headline-small font-black text-on-surface">How much will you pledge?</h2>
                 <div className="grid grid-cols-2 gap-4">
                    {QUICK_AMOUNTS.map(amt => (
                      <button 
                         key={amt} 
                         onClick={() => handleAmountSelect(amt)}
                         className="p-4 rounded-xl border-2 border-outline-variant hover:border-primary hover:bg-primary/5 text-title-medium font-bold text-on-surface transition-all"
                      >
                        {formatNGN(amt * 100)}
                      </button>
                    ))}
                 </div>
                 <div className="flex flex-col gap-2">
                    <Input 
                       placeholder="Other Amount (₦)"
                       value={customAmount}
                       onChange={(e) => setCustomAmount(e.target.value)}
                       className="h-14 text-center text-headline-small font-black"
                    />
                    <Button onClick={handleCustomSubmit} disabled={!customAmount} className="w-full">
                       Continue with Custom Amount
                    </Button>
                 </div>
              </div>
            )}

            {step === 1 && (
              <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-right-4">
                 <div className="flex flex-col gap-1">
                    <h2 className="text-headline-small font-black text-on-surface">Pledge Breakdown</h2>
                    <p className="text-body-small text-on-surface-variant font-medium">BuildBridge is transparent about every kobo.</p>
                 </div>

                 <Card className="divide-y divide-outline-variant/30 overflow-hidden shadow-none border-outline-variant">
                    <div className="p-4 flex justify-between items-center bg-surface-variant/20">
                       <span className="text-body-medium font-bold">Your Pledge</span>
                       <span className="text-body-large font-black text-on-surface">{formatNGN(amountKobo)}</span>
                    </div>
                    <div className="p-4 flex justify-between items-center">
                       <div className="flex items-center gap-1.5 text-on-surface-variant">
                          <span className="text-body-small">Platform Fee (5%)</span>
                          <Info className="h-3 w-3" />
                       </div>
                       <span className="text-body-small font-bold">-{formatNGN(platformFeeKobo)}</span>
                    </div>
                    <div className="p-4 flex justify-between items-center">
                       <div className="flex items-center gap-1.5 text-on-surface-variant">
                          <span className="text-body-small">Payment processing</span>
                          <Info className="h-3 w-3" />
                       </div>
                       <span className="text-body-small font-bold">-{formatNGN(processingFeeKobo)}</span>
                    </div>
                    <div className="p-5 flex justify-between items-center bg-primary/5">
                       <div className="flex flex-col">
                          <span className="text-label-small uppercase font-black text-primary tracking-widest">Net to Tradesperson</span>
                          <span className="text-body-small text-on-surface-variant font-medium">For their goal</span>
                       </div>
                       <span className="text-headline-small font-black text-primary">{formatNGN(netToTradespersonKobo)}</span>
                    </div>
                 </Card>

                 <Button onClick={() => setStep(2)} className="w-full h-16 rounded-2xl">
                    Continue to Message <ArrowRight className="ml-2 h-5 w-5" />
                 </Button>
              </div>
            )}

            {step === 2 && (
              <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-right-4">
                 <div className="flex flex-col gap-1">
                    <h2 className="text-headline-small font-black text-on-surface">Add a message?</h2>
                    <p className="text-body-small text-on-surface-variant font-medium">This is optional, but highly encouraged! (Max 500 chars)</p>
                 </div>
                 
                 <Textarea 
                    placeholder="e.g. Keep up the great work! I believe in your craft."
                    className="min-h-[140px]"
                    value={message}
                    onChange={(e) => setMessage(e.target.value.slice(0, 500))}
                 />

                 <div className="p-4 bg-badge-3/10 rounded-xl border border-badge-3/20 flex gap-3">
                    <Zap className="h-8 w-8 text-badge-3 flex-shrink-0" />
                    <p className="text-body-small text-on-surface">
                       <strong>Escrow Trust:</strong> Your funds will be held securely until {tradespersonName} provides proof of purchase for the {needName}.
                    </p>
                 </div>

                 <Button 
                    onClick={handlePaystackPayment} 
                    isLoading={loading} 
                    className="w-full h-20 text-headline-small rounded-2xl flex items-center justify-center gap-3 bg-on-surface text-surface hover:bg-on-surface/90"
                 >
                    <Lock className="h-6 w-6" />
                    Secure Payment
                 </Button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
