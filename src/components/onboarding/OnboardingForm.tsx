"use client"

import * as React from "react"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import { Input } from "@/components/ui/Input"
import { Textarea } from "@/components/ui/Textarea"
import { Avatar } from "@/components/ui/Avatar"
import { createClient } from "@/lib/supabase/client"
import { NIGERIA_LOCATIONS } from "@/lib/data/nigeria"
import { 
  Scissors, Hammer, ChefHat, Flame, Watch, 
  Store, Zap, Droplets, Sparkles, Shirt,
  ChevronLeft, ChevronRight, Camera, CheckCircle, Mic, MicOff, Loader2
} from "lucide-react"
import { useVoiceInput } from "@/hooks/useVoiceInput"
import { cn } from "@/lib/utils"

const STEPS = [
  "Trade",
  "Location",
  "Photo",
  "Story",
  "Preview",
  "Terms"
]

const TRADE_CATEGORIES = [
  { id: "tailor", label: "Tailor", icon: Scissors },
  { id: "carpenter", label: "Carpenter", icon: Hammer },
  { id: "baker", label: "Baker", icon: ChefHat },
  { id: "welder", label: "Welder", icon: Flame },
  { id: "cobbler", label: "Cobbler", icon: Watch },
  { id: "market_trader", label: "Market Trader", icon: Store },
  { id: "electrician", label: "Electrician", icon: Zap },
  { id: "plumber", label: "Plumber", icon: Droplets },
  { id: "hair_stylist", label: "Barber", icon: Sparkles },
  { id: "seamstress", label: "Seamstress", icon: Shirt },
]

export function OnboardingForm() {
  const router = useRouter()
  const supabase = createClient()
  const [currentStep, setCurrentStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const voiceInput = useVoiceInput()

  const [formData, setFormData] = useState({
    trade_category: "",
    location_state: "",
    location_lga: "",
    story: "",
    photo_url: "",
    photo_file: null as File | null,
    agreed_to_terms: false
  })

  // Navigation handlers
  const nextStep = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
      window.scrollTo(0, 0)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
      window.scrollTo(0, 0)
    }
  }

  // File upload handler
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData(prev => ({ 
        ...prev, 
        photo_file: file,
        photo_url: URL.createObjectURL(file) 
      }))
    }
  }

  // Final submission
  const handleSubmit = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Authentication required")

      let photoUrl = formData.photo_url

      // 1. Upload photo if exists
      if (formData.photo_file) {
        const fileExt = formData.photo_file.name.split('.').pop()
        const fileName = `${user.id}-${Math.random()}.${fileExt}`
        const filePath = `profiles/${fileName}`

        const { error: uploadError, data } = await supabase.storage
          .from("profiles")
          .upload(filePath, formData.photo_file)

        if (uploadError) throw uploadError
        
        const { data: { publicUrl } } = supabase.storage
          .from("profiles")
          .getPublicUrl(filePath)
        
        photoUrl = publicUrl
      }

      // 2. Save profile
      const { error: profileError } = await supabase
        .from("profiles")
        .upsert({
          user_id: user.id,
          trade_category: formData.trade_category,
          location_state: formData.location_state,
          location_lga: formData.location_lga,
          story: formData.story,
          photo_url: photoUrl,
          badge_level: "level_1_community_member", // Default starting level after onboarding
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })

      if (profileError) throw profileError

      router.push("/dashboard")
    } catch (err: any) {
      console.error("Onboarding error:", err)
      setError(err.message || "Something went wrong while saving your profile.")
    } finally {
      setLoading(false)
    }
  }

  // Step rendered based on currentStep
  const renderStep = () => {
    switch (currentStep) {
      case 0: // Trade Selector
        return (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex flex-col gap-6"
          >
            <div className="text-center">
              <h1 className="text-headline-medium text-primary font-bold mb-2">What is your trade?</h1>
              <p className="text-body-large text-on-surface-variant">Select the craft you specialize in.</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {TRADE_CATEGORIES.map((trade) => (
                <button
                  key={trade.id}
                  onClick={() => {
                    setFormData({ ...formData, trade_category: trade.id })
                    nextStep()
                  }}
                  className={`flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all ${
                    formData.trade_category === trade.id 
                    ? "border-primary bg-primary/5 text-primary shadow-sm" 
                    : "border-outline-variant hover:border-primary/50 text-on-surface-variant hover:bg-surface"
                  }`}
                >
                  <trade.icon className="h-10 w-10 mb-3" />
                  <span className="text-label-large font-bold">{trade.label}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )

      case 1: // Location Selector
        return (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex flex-col gap-8"
          >
            <div className="text-center">
              <h1 className="text-headline-medium text-primary font-bold mb-2">Where do you work?</h1>
              <p className="text-body-large text-on-surface-variant">Select your state and town or local area.</p>
            </div>
            
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-label-large font-bold text-on-surface">State</label>
                <select 
                  value={formData.location_state}
                  onChange={(e) => setFormData({ ...formData, location_state: e.target.value, location_lga: "" })}
                  className="h-14 w-full rounded-md border border-outline bg-transparent px-4 text-body-large text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Select State</option>
                  {Object.keys(NIGERIA_LOCATIONS).map((state) => (
                    <option key={state} value={state}>
                      {state.charAt(0).toUpperCase() + state.slice(1).replace("_", " ")}
                    </option>
                  ))}
                </select>
              </div>

              {formData.location_state && (
                <div className="flex flex-col gap-2">
                  <label className="text-label-large font-bold text-on-surface">LGA / City</label>
                  <select 
                    value={formData.location_lga}
                    onChange={(e) => setFormData({ ...formData, location_lga: e.target.value })}
                    className="h-14 w-full rounded-md border border-outline bg-transparent px-4 text-body-large text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Select Local Area</option>
                    {NIGERIA_LOCATIONS[formData.location_state].map((lga) => (
                      <option key={lga} value={lga}>{lga}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <Button 
                onClick={nextStep} 
                disabled={!formData.location_state || !formData.location_lga}
                className="w-full mt-4"
            >
              Continue
            </Button>
          </motion.div>
        )

      case 2: // Photo Upload
        return (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex flex-col gap-8 items-center"
          >
            <div className="text-center">
              <h1 className="text-headline-medium text-primary font-bold mb-2">Add a profile photo</h1>
              <p className="text-body-large text-on-surface-variant">A friendly photo helps backers trust you.</p>
            </div>

            <div className="relative group">
              <Avatar 
                src={formData.photo_url} 
                name="New Trade" 
                size="lg" 
                className="h-40 w-40 border-4 border-surface shadow-md" 
              />
              <label className="absolute bottom-2 right-2 bg-primary text-on-primary p-3 rounded-full shadow-lg cursor-pointer hover:scale-110 transition-transform">
                <Camera className="h-6 w-6" />
                <input type="file" className="hidden" accept="image/*" onChange={handlePhotoChange} />
              </label>
            </div>

            <div className="flex flex-col gap-4 w-full mt-4 text-center">
               <div className="p-4 bg-surface-variant rounded-xl border border-outline-variant inline-flex items-center gap-3">
                 <CheckCircle className="h-5 w-5 text-badge-2" />
                 <span className="text-body-medium">Recommended: A clear photo of your face or workshop.</span>
               </div>
               
               <Button onClick={nextStep} disabled={!formData.photo_url} className="w-full mt-2">
                 Continue
               </Button>
               <button onClick={nextStep} className="text-label-large font-bold text-on-surface-variant hover:text-primary transition-colors">
                 Skip for now
               </button>
            </div>
          </motion.div>
        )

      case 3: // Personal Story
        return (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col gap-6"
            >
              <div className="text-center">
                <h1 className="text-headline-medium text-primary font-bold mb-2">Tell your story</h1>
                <p className="text-body-large text-on-surface-variant">Explain what you do and what your goal is.</p>
              </div>

              <div className="flex flex-col gap-4">
                <div className="p-4 bg-surface rounded-xl border border-outline-variant">
                   <p className="text-label-medium font-bold text-primary mb-2 uppercase tracking-wide">Prompts:</p>
                   <p className="text-body-small italic text-on-surface-variant">
                     "I started my trade as a carpenter in 2015. Growing my shop will help me employ 3 more people in my community..."
                   </p>
                </div>

                <Textarea 
                  label="Your Story"
                  placeholder="Tell us about yourself and your work..."
                  value={voiceInput.isListening ? `${formData.story} ${voiceInput.transcript}`.trim() : formData.story}
                  onChange={(e) => {
                     if (!voiceInput.isListening) {
                        setFormData({ ...formData, story: e.target.value })
                     }
                  }}
                  className="min-h-[200px]"
                  error={formData.story.split(/\s+/).filter(Boolean).length > 300 ? "Please keep your story under 300 words." : undefined}
                />
                
                <div className="flex justify-between items-center text-label-small">
                  <div className="flex-1">
                    {voiceInput.isSupported && (
                      <button 
                        onClick={() => {
                          if (voiceInput.isListening) {
                            voiceInput.stopListening();
                            setFormData(prev => ({ ...prev, story: `${prev.story} ${voiceInput.transcript}`.trim() }));
                          } else {
                            voiceInput.startListening();
                          }
                        }}
                        className={cn(
                          "flex items-center gap-2 px-4 py-2 rounded-full font-bold transition-all",
                          voiceInput.isListening 
                            ? "bg-error text-white animate-pulse shadow-md" 
                            : "bg-surface border border-outline-variant text-on-surface hover:bg-surface-variant hover:text-primary"
                        )}
                      >
                        {voiceInput.isListening ? (
                          <>
                             <MicOff className="h-4 w-4" /> Stop Dictation
                          </>
                        ) : (
                          <>
                             <Mic className="h-4 w-4" /> Tap to Speak
                          </>
                        )}
                      </button>
                    )}
                  </div>
                  
                  <span className={cn(
                    "font-medium",
                    formData.story.split(/\s+/).filter(Boolean).length > 300 ? "text-error" : "text-on-surface-variant"
                  )}>
                    {(voiceInput.isListening ? `${formData.story} ${voiceInput.transcript}`.trim() : formData.story).split(/\s+/).filter(Boolean).length} / 300 words
                  </span>
                </div>
              </div>

              <Button 
                 onClick={nextStep} 
                 disabled={(!formData.story && !voiceInput.transcript) || (voiceInput.isListening ? `${formData.story} ${voiceInput.transcript}`.trim() : formData.story).split(/\s+/).filter(Boolean).length > 300} 
                 className="w-full mt-4"
               >
                 Continue
               </Button>
            </motion.div>
          )

      case 4: // Profile Preview
        return (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col gap-8"
            >
              <div className="text-center">
                <h1 className="text-headline-medium text-primary font-bold mb-2">Does this look right?</h1>
                <p className="text-body-large text-on-surface-variant">This is a preview of your public profile.</p>
              </div>

              <Card className="overflow-hidden p-0 border-primary shadow-lg ring-4 ring-primary/5">
                <div className="h-32 bg-primary/10 relative">
                   <div className="absolute -bottom-10 left-6">
                      <Avatar src={formData.photo_url} name="User" size="lg" className="h-20 w-20 border-4 border-surface shadow-md" />
                   </div>
                </div>
                <div className="pt-14 pb-6 px-6 flex flex-col gap-4">
                  <div>
                    <h3 className="text-headline-small font-black text-on-surface capitalize"> {formData.trade_category.replace("_", " ")}</h3>
                    <p className="text-on-surface-variant font-medium flex items-center gap-1">
                       <Sparkles className="h-4 w-4 text-badge-3" />
                       {formData.location_lga}, {formData.location_state.toUpperCase()}
                    </p>
                  </div>
                  
                  <div className="bg-surface-variant p-4 rounded-xl">
                    <p className="text-body-medium text-on-surface italic line-clamp-3">
                      "{formData.story}"
                    </p>
                  </div>
                </div>
              </Card>

              <div className="flex flex-col gap-3">
                 <Button onClick={nextStep} className="w-full">
                   Yes, this is me
                 </Button>
                 <button onClick={() => setCurrentStep(0)} className="text-label-large font-bold text-on-surface-variant hover:text-primary transition-colors">
                   No, let me edit something
                 </button>
              </div>
            </motion.div>
          )

      case 5: // Terms of Service
        return (
            <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col gap-8"
            >
                <div className="text-center">
                    <h1 className="text-headline-medium text-primary font-bold mb-2">Final Step</h1>
                    <p className="text-body-large text-on-surface-variant">Please review our community guidelines.</p>
                </div>

                <div className="flex flex-col gap-4 p-6 bg-surface-variant rounded-2xl border border-outline-variant">
                    <div className="flex gap-4">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold">1</div>
                        <p className="text-body-medium text-on-surface">I promise to only request funding for real tools or needs that help my trade.</p>
                    </div>
                    <div className="flex gap-4">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold">2</div>
                        <p className="text-body-medium text-on-surface">I will upload a clear photo of the items I bought with my pledge money.</p>
                    </div>
                    <div className="flex gap-4">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold">3</div>
                        <p className="text-body-medium text-on-surface">I understand that verified profiles reach their funding goals 4x faster.</p>
                    </div>
                </div>

                <label className="flex items-center gap-3 cursor-pointer p-4 hover:bg-surface rounded-xl transition-colors">
                    <input 
                        type="checkbox" 
                        checked={formData.agreed_to_terms}
                        onChange={(e) => setFormData({ ...formData, agreed_to_terms: e.target.checked })}
                        className="h-6 w-6 rounded border-outline text-primary focus:ring-primary"
                    />
                    <span className="text-label-large text-on-surface">I understand and agree to the community rules.</span>
                </label>

                {error && (
                    <p className="text-body-small text-error p-3 bg-error/5 border border-error/20 rounded-lg text-center">{error}</p>
                )}

                <Button onClick={handleSubmit} isLoading={loading} disabled={!formData.agreed_to_terms} className="w-full">
                    Create My Profile
                </Button>
            </motion.div>
        )

      default:
        return null
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-12 min-h-screen flex flex-col justify-center">
      {/* Progress Bar */}
      <div className="mb-12">
        <div className="flex justify-between text-label-small text-on-surface-variant mb-2">
          <span>Step {currentStep + 1} of {STEPS.length}</span>
          <span>{Math.round(((currentStep + 1) / STEPS.length) * 100)}% Complete</span>
        </div>
        <div className="h-1.5 w-full bg-surface-variant rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Back button */}
      {currentStep > 0 && (
          <button 
            onClick={prevStep}
            className="mb-6 flex items-center gap-2 text-label-large font-bold text-on-surface-variant hover:text-on-surface transition-colors"
          >
              <ChevronLeft className="h-5 w-5" />
              Back
          </button>
      )}

      {/* Form Content */}
      <div className="relative overflow-visible">
        <AnimatePresence mode="wait">
          <React.Fragment key={currentStep}>
            {renderStep()}
          </React.Fragment>
        </AnimatePresence>
      </div>

      {/* Helper text for Mobile */}
      <div className="mt-12 text-center text-body-small text-on-surface-variant">
        Pockets of trust building communities.
      </div>
    </div>
  )
}
