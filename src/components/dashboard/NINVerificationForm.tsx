"use client"

import * as React from "react"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Card } from "@/components/ui/Card"
import { 
  ShieldCheck, 
  Lock, 
  Zap, 
  Loader2, 
  CheckCircle2, 
  ChevronRight,
  Info
} from "lucide-react"
import { cn } from "@/lib/utils"

interface NINVerificationFormProps {
  onSuccess: () => void;
  onClose: () => void;
}

export function NINVerificationForm({ onSuccess, onClose }: NINVerificationFormProps) {
  const [step, setStep] = useState(0) // 0: Input, 1: Verification, 2: Success
  const [nin, setNin] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleVerify = async () => {
    if (nin.length !== 11) {
      setError("Please enter a valid 11-digit NIN.")
      return
    }

    setLoading(true)
    setError(null)
    setStep(1) // Show verifying UI

    try {
      const res = await fetch('/api/identity/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'nin', documentId: nin })
      })
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Verification failed")
      }

      setStep(2) // Show success
    } catch (err: any) {
      console.error(err)
      setError(err.message)
      setStep(0) // Return to input if error
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      
      <AnimatePresence mode="wait">
        
        {step === 0 && (
          <motion.div 
            key="input"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col gap-6"
          >
            <div className="text-center">
               <h2 className="text-display-small font-black text-on-surface">Verify Your <span className="text-primary italic">Identity.</span></h2>
               <p className="text-body-large text-on-surface-variant">Level 4 verification requires a valid Government NIN.</p>
            </div>

            <div className="p-4 bg-badge-1/10 border border-badge-1/30 rounded-2xl flex gap-3">
               <ShieldCheck className="h-8 w-8 text-badge-1 flex-shrink-0" />
               <div className="flex flex-col gap-1">
                  <p className="text-label-medium font-bold text-badge-1 uppercase tracking-widest">Privacy First</p>
                  <p className="text-body-small text-on-surface-variant">
                    We use 256-bit encryption. Your NIN is only used for verification and is never shared publicly.
                  </p>
               </div>
            </div>

            <div className="flex flex-col gap-2">
               <Input 
                  label="National Identity Number (NIN)"
                  placeholder="Enter 11-digit NIN..."
                  value={nin}
                  autoFocus
                  onChange={(e) => setNin(e.target.value.replace(/[^0-9]/g, "").slice(0, 11))}
                  error={error}
                  className="h-14 font-black tracking-widest text-center"
               />
               <p className="text-label-small text-on-surface-variant text-center">
                  Don't have your NIN? Dial *346# on your registered mobile number.
               </p>
            </div>

            <Button onClick={handleVerify} isLoading={loading} className="w-full text-headline-small py-8 rounded-2xl">
               Start Biometric Match
            </Button>
          </motion.div>
        )}

        {step === 1 && (
          <motion.div 
            key="verifying"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="flex flex-col items-center justify-center py-12 gap-8 text-center"
          >
             <div className="relative">
                <Loader2 className="h-32 w-32 text-primary animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                   <Zap className="h-10 w-10 text-primary animate-pulse" />
                </div>
             </div>
             <div className="flex flex-col gap-2">
                <h3 className="text-display-small font-black text-on-surface">Validating <span className="text-primary">Biometrics...</span></h3>
                <p className="text-body-large text-on-surface-variant">This usually takes less than 60 seconds.</p>
             </div>
             
             <div className="w-full max-w-sm h-2 bg-surface-variant/30 rounded-full overflow-hidden">
                <motion.div 
                   className="h-full bg-primary"
                   initial={{ width: 0 }}
                   animate={{ width: "100%" }}
                   transition={{ duration: 4, ease: "linear" }}
                />
             </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div 
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-12 gap-8 text-center"
          >
             <div className="h-24 w-24 rounded-full bg-badge-2 text-white flex items-center justify-center shadow-lg shadow-badge-2/30">
                <CheckCircle2 className="h-14 w-14" />
             </div>
             <div className="flex flex-col gap-2">
                <h3 className="text-display-small font-black text-badge-2">Identity <span className="text-on-surface">Verified!</span></h3>
                <p className="text-body-large text-on-surface-variant max-w-sm">
                   Congratulations! You've reached **Level 4: Platform Verified**.
                </p>
             </div>

             <Button onClick={() => {onSuccess(); onClose();}} className="w-full text-headline-small py-8 rounded-2xl">
                Go to Dashboard
             </Button>
          </motion.div>
        )}

      </AnimatePresence>

      <button onClick={onClose} className="text-label-large font-bold text-on-surface-variant hover:text-on-surface transition-colors flex items-center justify-center gap-2">
         {step === 2 ? null : "Cancel Verification"}
      </button>

    </div>
  )
}
