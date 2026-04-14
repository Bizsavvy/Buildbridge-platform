"use client"

import * as React from "react"
import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/Button"
import { Textarea } from "@/components/ui/Textarea"
import { submitToImpactWallAction } from "@/app/actions/impact"
import { 
  Sparkles, 
  CheckCircle2, 
  ShieldCheck, 
  Info,
  X
} from "lucide-react"

interface SubmitImpactModalProps {
  needId: string;
  itemName: string;
  onSuccess: () => void;
  onClose: () => void;
}

export function SubmitImpactModal({ needId, itemName, onSuccess, onClose }: SubmitImpactModalProps) {
  const [step, setStep] = useState(0) // 0: Consent/Info, 1: Caption, 2: Success
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [caption, setCaption] = useState("")
  const [consent, setConsent] = useState(true)

  const handleSubmit = async () => {
    if (!caption || caption.length < 10) {
      setError("Please write a short success story (at least 10 characters).")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append("need_id", needId)
      formData.append("caption", caption)
      if (consent) formData.append("public_display_consent", "on")

      const result = await submitToImpactWallAction(formData)

      if (result.success) {
        setStep(2)
      } else {
        setError(result.error || "Failed to submit story.")
      }
    } catch (err) {
      setError("An unexpected error occurred.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      
      {/* Header */}
      <div className="flex items-center justify-between">
         <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <span className="text-label-large font-black uppercase tracking-widest text-primary">Success Journey</span>
         </div>
         <button onClick={onClose} className="p-2 hover:bg-surface-variant/50 rounded-full transition-colors">
            <X className="h-5 w-5" />
         </button>
      </div>

      {step === 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }} 
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-6"
        >
          <div className="space-y-2">
             <h2 className="text-display-small font-black text-on-surface leading-tight">
                Share your success with the <span className="text-primary italic">Community.</span>
             </h2>
             <p className="text-body-large text-on-surface-variant">
                You successfully funded **{itemName}**. By adding this to the Impact Wall, you inspire future backers and tradespeople.
             </p>
          </div>

          <div className="p-4 bg-badge-1/10 border border-badge-1/30 rounded-2xl flex gap-3">
             <ShieldCheck className="h-6 w-6 text-badge-1 flex-shrink-0" />
             <p className="text-body-small text-on-surface-variant">
                Verified success stories improve your trust score and help you get funded **2x faster** on your next need.
             </p>
          </div>

          <label className="flex items-start gap-3 p-4 bg-surface-variant/30 rounded-2xl cursor-pointer">
             <input 
                type="checkbox" 
                checked={consent} 
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-1 h-5 w-5 rounded border-outline text-primary focus:ring-primary" 
             />
             <span className="text-body-small font-medium text-on-surface-variant">
                I consent to BuildBridge displaying my success story and proof media publicly on the Impact Wall.
             </span>
          </label>

          <Button onClick={() => setStep(1)} disabled={!consent} className="h-14 rounded-2xl text-title-medium">
             Continue to Story
          </Button>
        </motion.div>
      )}

      {step === 1 && (
        <motion.div 
          initial={{ opacity: 0, x: 20 }} 
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col gap-6"
        >
          <div className="space-y-2">
             <h3 className="text-headline-small font-black">Write a success caption</h3>
             <p className="text-body-medium text-on-surface-variant">How has this funding impacted your trade?</p>
          </div>

          <div className="flex flex-col gap-2">
             <Textarea 
                placeholder="e.g. This welding machine has doubled my daily output. Customers are much happier with the precision!"
                className="min-h-[120px] text-body-large rounded-2xl"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                autoFocus
             />
             {error && <p className="text-label-small text-error font-bold">{error}</p>}
          </div>

          <div className="p-4 rounded-xl bg-surface-variant/20 flex gap-2">
             <Info className="h-5 w-5 text-primary shrink-0" />
             <p className="text-label-small text-on-surface-variant">
                Your caption will be reviewed by our moderation team before appearing on the public wall.
             </p>
          </div>

          <div className="flex gap-4">
             <Button variant="ghost" onClick={() => setStep(0)} className="flex-1 h-14 rounded-2xl">
                Back
             </Button>
             <Button onClick={handleSubmit} isLoading={loading} className="flex-[2] h-14 rounded-2xl text-title-medium">
                Submit Story
             </Button>
          </div>
        </motion.div>
      )}

      {step === 2 && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }} 
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-10 text-center gap-6"
        >
          <div className="h-20 w-20 rounded-full bg-badge-2 text-white flex items-center justify-center shadow-lg shadow-badge-2/30">
             <CheckCircle2 className="h-10 w-10" />
          </div>
          <div className="space-y-2">
             <h3 className="text-headline-large font-black text-on-surface">Submitted!</h3>
             <p className="text-body-large text-on-surface-variant max-w-xs">
                Your success story is now in the moderation queue. Thank you for building the BuildBridge community.
             </p>
          </div>
          <Button onClick={() => { onSuccess(); onClose(); }} className="w-full h-14 rounded-2xl">
             Back to Dashboard
          </Button>
        </motion.div>
      )}

    </div>
  )
}
