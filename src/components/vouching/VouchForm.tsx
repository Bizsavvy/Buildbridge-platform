"use client"

import * as React from "react"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/Button"
import { Textarea } from "@/components/ui/Textarea"
import { submitVouchAction } from "@/app/actions/vouch"
import { 
  Users,
  Store,
  Briefcase,
  Home,
  CheckCircle2,
  AlertTriangle,
  Info
} from "lucide-react"
import { cn } from "@/lib/utils"

interface VouchFormProps {
  recipientProfileId: string;
  recipientName: string;
}

const RELATIONSHIP_TYPES = [
  { id: "customer", label: "Customer / Client", icon: Users },
  { id: "neighborhood", label: "Neighbor", icon: Home },
  { id: "market_colleague", label: "Market Colleague", icon: Store },
  { id: "apprentice_master", label: "Master / Apprentice", icon: Briefcase },
]

export function VouchForm({ recipientProfileId, recipientName }: VouchFormProps) {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    relationship_type: "",
    relationship_duration_years: "1",
    statement: "",
    understood_liability: false
  })

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const data = new FormData()
      data.append("recipient_profile_id", recipientProfileId)
      data.append("relationship_type", formData.relationship_type)
      data.append("relationship_duration_years", formData.relationship_duration_years)
      data.append("statement", formData.statement)

      const result = await submitVouchAction(data)
      
      if (result.success) {
        setStep(3) // Success screen
      } else {
        setError(result.error || "Failed to submit vouch.")
      }
    } catch (err: any) {
      setError("An unexpected error occurred.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-8">
      
      {step < 3 && (
        <div className="flex gap-2 mb-8">
           {[0, 1, 2].map((i) => (
             <div key={i} className={cn(
                "h-2 flex-1 rounded-full overflow-hidden",
                i <= step ? "bg-primary" : "bg-surface-variant"
             )}></div>
           ))}
        </div>
      )}

      <AnimatePresence mode="wait">
        
        {step === 0 && (
          <motion.div 
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex flex-col gap-8"
          >
            <div className="text-center">
              <h1 className="text-display-small text-primary font-black mb-2">How do you know {recipientName}?</h1>
              <p className="text-body-large text-on-surface-variant">Select your relationship.</p>
            </div>

            <div className="flex flex-col gap-4">
              {RELATIONSHIP_TYPES.map((type) => {
                const Icon = type.icon
                return (
                  <button
                    key={type.id}
                    onClick={() => setFormData({ ...formData, relationship_type: type.id })}
                    className={cn(
                      "flex items-center p-4 rounded-2xl border-2 transition-all text-left",
                      formData.relationship_type === type.id 
                        ? "border-primary bg-primary/5 shadow-md" 
                        : "border-outline-variant hover:border-primary/50 bg-surface"
                    )}
                  >
                    <div className={cn(
                       "h-12 w-12 rounded-full flex items-center justify-center mr-4",
                       formData.relationship_type === type.id ? "bg-primary text-surface" : "bg-surface-variant text-on-surface"
                    )}>
                       <Icon className="h-6 w-6" />
                    </div>
                    <div>
                       <span className="text-title-medium font-bold text-on-surface">{type.label}</span>
                    </div>
                  </button>
                )
              })}
            </div>

            <div className="flex flex-col gap-2">
               <label className="text-label-large font-bold px-2">How many years have you known them?</label>
               <input 
                  type="range"
                  min="1"
                  max="20"
                  step="1"
                  value={formData.relationship_duration_years}
                  onChange={(e) => setFormData({ ...formData, relationship_duration_years: e.target.value })}
                  className="w-full h-3 bg-surface-variant rounded-full appearance-none cursor-pointer accent-primary mt-2"
               />
               <div className="text-center text-title-medium font-black mt-2">
                  {formData.relationship_duration_years} {parseInt(formData.relationship_duration_years) === 1 ? 'Year' : 'Years'}
               </div>
            </div>

            <Button onClick={() => setStep(1)} disabled={!formData.relationship_type} className="w-full h-16 rounded-2xl mt-4">
               Continue
            </Button>
          </motion.div>
        )}

        {step === 1 && (
          <motion.div 
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex flex-col gap-8"
          >
            <div className="text-center">
              <h1 className="text-display-small text-primary font-black mb-2">Write your statement</h1>
              <p className="text-body-large text-on-surface-variant">Why should the community trust {recipientName}?</p>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap gap-2">
                  {["I have hired them to...", "They always deliver...", "I can vouch for their... "].map(starter => (
                      <button 
                          key={starter}
                          onClick={() => setFormData({ ...formData, statement: starter })}
                          className="text-label-small bg-surface border border-outline-variant px-3 py-1.5 rounded-full hover:bg-primary/5 hover:border-primary transition-colors text-on-surface-variant"
                      >
                          + {starter}
                      </button>
                  ))}
              </div>
              <Textarea 
                  className="min-h-[200px] text-body-large"
                  value={formData.statement}
                  onChange={(e) => setFormData({ ...formData, statement: e.target.value })}
                  placeholder="Tell us about their character and work ethic..."
              />
              <div className="flex justify-between items-center text-label-small">
                 <span className={formData.statement.length < 20 ? "text-error" : "text-badge-2"}>
                    {formData.statement.length < 20 ? "Too short" : "Looks good!"}
                 </span>
              </div>
            </div>

            <div className="flex gap-4 mt-4">
               <Button variant="ghost" onClick={() => setStep(0)} className="w-1/3 h-16 rounded-2xl border-2 border-outline-variant">
                 Back
               </Button>
               <Button onClick={() => setStep(2)} disabled={formData.statement.length < 20} className="flex-1 h-16 rounded-2xl">
                 Continue
               </Button>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div 
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex flex-col gap-8"
          >
            <div className="text-center">
              <h1 className="text-display-small text-primary font-black mb-2">One Last Thing</h1>
            </div>

            <div className="p-6 bg-badge-3/10 border-2 border-badge-3/30 rounded-3xl flex flex-col gap-4">
               <div className="flex items-center justify-center h-16 w-16 bg-badge-3 text-surface rounded-full mx-auto mb-2">
                 <AlertTriangle className="h-8 w-8" />
               </div>
               <h3 className="text-title-medium font-black text-on-surface text-center">Your Reputation Commitment</h3>
               <p className="text-body-large text-on-surface-variant text-center">
                 Vouching does <strong className="text-error">not</strong> make you financially responsible if {recipientName} fails to deliver on a goal.
               </p>
               <div className="mt-2 p-4 bg-surface rounded-xl border border-outline-variant">
                 <p className="text-body-small text-on-surface text-center">
                   However, if a listing is proven fraudulent, the Trust Engine will penalise your profile and revoke your right to vouch. 
                   <br/><strong>Your reputation is your commitment.</strong>
                 </p>
               </div>
            </div>

            {error && (
              <div className="p-4 bg-error/10 text-error rounded-xl font-medium text-center text-body-small border border-error/50">
                {error}
              </div>
            )}

            <label className="flex items-start gap-4 p-4 hover:bg-surface-variant/30 rounded-2xl cursor-pointer transition-colors border border-transparent hover:border-outline-variant">
               <div className="mt-1">
                 <input 
                    type="checkbox" 
                    checked={formData.understood_liability}
                    onChange={(e) => setFormData({ ...formData, understood_liability: e.target.checked })}
                    className="h-6 w-6 rounded border-outline text-primary focus:ring-primary"
                 />
               </div>
               <span className="text-body-medium font-bold text-on-surface leading-snug">
                 I declare that I truly know {recipientName} and vouch for their honesty.
               </span>
            </label>

            <div className="flex gap-4 mt-2">
               <Button variant="ghost" disabled={loading} onClick={() => setStep(1)} className="w-1/3 h-16 rounded-2xl border-2 border-outline-variant">
                 Back
               </Button>
               <Button onClick={handleSubmit} isLoading={loading} disabled={!formData.understood_liability} className="flex-1 h-16 rounded-2xl text-title-medium">
                 Submit Vouch
               </Button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
           <motion.div 
           key="success"
           initial={{ opacity: 0, scale: 0.9 }}
           animate={{ opacity: 1, scale: 1 }}
           className="flex flex-col items-center justify-center py-12 gap-8 text-center"
         >
            <div className="h-32 w-32 rounded-full bg-badge-2 text-white flex items-center justify-center shadow-2xl shadow-badge-2/40">
               <CheckCircle2 className="h-20 w-20" />
            </div>
            <div className="flex flex-col gap-4">
               <h3 className="text-display-medium font-black text-on-surface">Thank You!</h3>
               <p className="text-body-large text-on-surface-variant max-w-sm mx-auto">
                  Your vouch has been recorded. You've helped {recipientName} build their reputation.
               </p>
            </div>

            <Button onClick={() => router.push(`/profile/${recipientProfileId}`)} className="w-full text-title-medium h-16 rounded-2xl shadow-lg mt-4">
               Return to Profile
            </Button>
         </motion.div>
        )}

      </AnimatePresence>
    </div>
  )
}
