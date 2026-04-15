"use client"

import * as React from "react"
import { useState, useEffect } from "react"
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
  ChevronLeft, ChevronRight, Camera, CheckCircle, Mic, MicOff, Loader2,
  Rocket, Lock, UserPlus, Fingerprint
} from "lucide-react"
import { useVoiceInput } from "@/hooks/useVoiceInput"
import { cn } from "@/lib/utils"

const STEPS = [
  { id: "trade", title: "Your Craft", desc: "Showcase your specialization" },
  { id: "location", title: "Your Roots", desc: "Where you build legacies" },
  { id: "auth", title: "Secure Account", desc: "Protect your progress" },
  { id: "photo", title: "Your Face", desc: "Build human trust" },
  { id: "story", title: "Your Story", desc: "Share your journey" },
  { id: "terms", title: "Commitment", desc: "Join the covenant" }
]

const TRADE_CATEGORIES = [
  { id: "tailor", label: "Tailor", icon: Scissors, color: "text-purple-500", bg: "bg-purple-100" },
  { id: "carpenter", label: "Carpenter", icon: Hammer, color: "text-amber-600", bg: "bg-amber-100" },
  { id: "baker", label: "Baker", icon: ChefHat, color: "text-yellow-600", bg: "bg-yellow-100" },
  { id: "welder", label: "Welder", icon: Flame, color: "text-orange-500", bg: "bg-orange-100" },
  { id: "cobbler", label: "Cobbler", icon: Watch, color: "text-blue-500", bg: "bg-blue-100" },
  { id: "market_trader", label: "Market Trader", icon: Store, color: "text-green-600", bg: "bg-green-100" },
  { id: "electrician", label: "Electrician", icon: Zap, color: "text-cyan-500", bg: "bg-cyan-100" },
  { id: "plumber", label: "Plumber", icon: Droplets, color: "text-indigo-500", bg: "bg-indigo-100" },
  { id: "hair_stylist", label: "Barber", icon: Sparkles, color: "text-rose-500", bg: "bg-rose-100" },
  { id: "seamstress", label: "Seamstress", icon: Shirt, color: "text-pink-500", bg: "bg-pink-100" },
]

export function OnboardingForm() {
  const router = useRouter()
  const supabase = createClient()
  const [currentStep, setCurrentStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)
  
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

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      if (user && currentStep === 2) {
        setCurrentStep(3) // Skip auth step if already logged in
      }
    }
    checkUser()
  }, [supabase, currentStep])

  const nextStep = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

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

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)
    try {
      if (!user) {
        setCurrentStep(2) // Fallback to auth step
        return
      }

      let photoUrl = formData.photo_url

      if (formData.photo_file) {
        const fileExt = formData.photo_file.name.split('.').pop()
        const fileName = `${user.id}-${Math.random()}.${fileExt}`
        const filePath = `profiles/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from("profiles")
          .upload(filePath, formData.photo_file)

        if (uploadError) throw uploadError
        
        const { data: { publicUrl } } = supabase.storage
          .from("profiles")
          .getPublicUrl(filePath)
        
        photoUrl = publicUrl
      }

      const { error: profileError } = await supabase
        .from("profiles")
        .upsert({
          user_id: user.id,
          trade_category: formData.trade_category,
          location_state: formData.location_state,
          location_lga: formData.location_lga,
          story: formData.story,
          photo_url: photoUrl,
          badge_level: "level_1_community_member",
          updated_at: new Date().toISOString()
        })

      if (profileError) throw profileError
      router.push("/dashboard")
    } catch (err: any) {
      console.error("Onboarding error:", err)
      setError(err.message || "Failed to save your profile.")
    } finally {
      setLoading(false)
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Trade
        return (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-4xl mx-auto"
          >
            <div className="mb-12 text-center">
              <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-black uppercase tracking-widest mb-6 border border-primary/20">
                Phase 1: Discovery
              </span>
              <h1 className="text-4xl md:text-5xl font-black text-on-surface mb-4">What IS your <span className="text-primary italic">Craft?</span></h1>
              <p className="text-lg text-on-surface-variant font-medium">Select the skill that defines your legacy.</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {TRADE_CATEGORIES.map((trade) => (
                <button
                  key={trade.id}
                  onClick={() => {
                    setFormData({ ...formData, trade_category: trade.id })
                    nextStep()
                  }}
                  className={cn(
                    "flex flex-col items-center justify-center aspect-square p-4 rounded-[2rem] border-2 transition-all group relative overflow-hidden",
                    formData.trade_category === trade.id 
                    ? "border-primary bg-primary text-white shadow-2xl shadow-primary/30" 
                    : "border-outline-variant bg-white/50 backdrop-blur-sm hover:border-primary/50 text-on-surface hover:bg-white"
                  )}
                >
                  <trade.icon className={cn("h-10 w-10 mb-3 transition-transform group-hover:scale-110", formData.trade_category === trade.id ? "text-white" : trade.color)} />
                  <span className="text-xs font-black uppercase tracking-widest text-center">{trade.label}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )

      case 1: // Location
        return (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-lg mx-auto"
          >
             <div className="mb-12 text-center">
              <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-black uppercase tracking-widest mb-6 border border-primary/20">
                Phase 1: Roots
              </span>
              <h1 className="text-4xl font-black text-on-surface mb-4">Where do you <span className="text-primary italic">build?</span></h1>
              <p className="text-lg text-on-surface-variant font-medium">Connect with backers in your community.</p>
            </div>

            <div className="bg-white/70 backdrop-blur-xl p-8 rounded-[3rem] border border-white/50 shadow-2xl flex flex-col gap-6">
              <div className="flex flex-col gap-3">
                <label className="text-sm font-black text-on-surface uppercase tracking-widest px-2">State</label>
                <select 
                  value={formData.location_state}
                  onChange={(e) => setFormData({ ...formData, location_state: e.target.value, location_lga: "" })}
                  className="h-14 w-full rounded-3xl border-2 border-outline-variant bg-white px-6 text-on-surface font-bold focus:border-primary transition-all outline-none appearance-none"
                >
                  <option value="">Select State</option>
                  {Object.keys(NIGERIA_LOCATIONS).map((state) => (
                    <option key={state} value={state}>
                      {state.charAt(0).toUpperCase() + state.slice(1).replace("_", " ")}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-3">
                <label className="text-sm font-black text-on-surface uppercase tracking-widest px-2">LGA / City</label>
                <select 
                  value={formData.location_lga}
                  onChange={(e) => setFormData({ ...formData, location_lga: e.target.value })}
                  disabled={!formData.location_state}
                  className="h-14 w-full rounded-3xl border-2 border-outline-variant bg-white px-6 text-on-surface font-bold focus:border-primary transition-all outline-none appearance-none disabled:opacity-50"
                >
                  <option value="">Select Local Area</option>
                  {formData.location_state && NIGERIA_LOCATIONS[formData.location_state].map((lga) => (
                    <option key={lga} value={lga}>{lga}</option>
                  ))}
                </select>
              </div>

              <Button 
                  onClick={nextStep} 
                  disabled={!formData.location_state || !formData.location_lga}
                  className="h-14 rounded-full text-lg w-full mt-4"
              >
                Secure My Progress
                <ChevronRight className="h-5 w-5 ml-2" />
              </Button>
            </div>
          </motion.div>
        )

      case 2: // Auth Checkpoint
        return (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="w-full max-w-md mx-auto"
          >
            <div className="mb-12 text-center text-white">
               <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center mx-auto mb-8 shadow-2xl">
                  <Lock className="h-8 w-8 text-white" />
               </div>
               <h1 className="text-4xl font-black mb-4 tracking-tight">Lock it in.</h1>
               <p className="text-xl text-white/80 font-medium leading-relaxed">
                  We've captured your trade and location. Create an account to protect your journey and continue.
               </p>
            </div>

            <div className="flex flex-col gap-4">
              <Button 
                onClick={() => router.push(`/signup?redirect=onboarding`)}
                className="h-16 rounded-[2rem] bg-white text-primary hover:bg-white/90 text-lg font-black shadow-2xl flex items-center justify-center gap-3"
              >
                <UserPlus className="h-5 w-5" />
                Join the Network
              </Button>
              <button 
                onClick={() => router.push(`/login?redirect=onboarding`)}
                className="h-16 rounded-[2rem] bg-white/10 backdrop-blur-md border border-white/30 text-white hover:bg-white/20 text-lg font-black transition-all flex items-center justify-center gap-3"
              >
                <Fingerprint className="h-5 w-5" />
                Welcome Back
              </button>
            </div>
            
            <p className="mt-8 text-center text-white/60 text-sm font-bold uppercase tracking-widest">
               Pockets of Trust Building Communities
            </p>
          </motion.div>
        )

      case 3: // Photo
        return (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-md mx-auto text-center"
          >
            <div className="mb-12">
              <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-black uppercase tracking-widest mb-6 border border-primary/20">
                Phase 2: Presence
              </span>
              <h1 className="text-4xl font-black text-on-surface mb-4">Show your <span className="text-primary italic">Face.</span></h1>
              <p className="text-lg text-on-surface-variant font-medium">Transparency is the bedrock of BuildBridge.</p>
            </div>

            <div className="relative inline-block group mb-12">
               <div className="absolute inset-0 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-all" />
               <Avatar 
                src={formData.photo_url} 
                name={user?.email || "Artisan"} 
                size="lg" 
                className="h-56 w-56 border-8 border-white shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] relative" 
              />
              <label className="absolute bottom-4 right-4 bg-primary text-on-primary p-5 rounded-full shadow-2xl cursor-pointer hover:scale-110 active:scale-90 transition-all border-4 border-white">
                <Camera className="h-8 w-8" />
                <input type="file" className="hidden" accept="image/*" onChange={handlePhotoChange} />
              </label>
            </div>

            <div className="flex flex-col gap-4">
              <Button onClick={nextStep} disabled={!formData.photo_url} className="h-14 rounded-full text-lg w-full">
                Continue to Story
              </Button>
              <button 
                onClick={nextStep} 
                className="text-sm font-black text-on-surface-variant uppercase tracking-widest hover:text-primary transition-colors py-2"
              >
                Skip for now
              </button>
            </div>
          </motion.div>
        )

      case 4: // Story
        return (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-2xl mx-auto"
          >
            <div className="mb-12 text-center">
              <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-black uppercase tracking-widest mb-6 border border-primary/20">
                Phase 2: Narrative
              </span>
              <h1 className="text-4xl font-black text-on-surface mb-4">Voice your <span className="text-primary italic">Legacy.</span></h1>
              <p className="text-lg text-on-surface-variant font-medium">Tell the world why your trade matters.</p>
            </div>

            <div className="bg-white/70 backdrop-blur-xl p-8 rounded-[3rem] border border-white/50 shadow-2xl flex flex-col gap-8">
                <div className="space-y-4">
                   <div className="p-5 bg-primary/5 rounded-2xl border border-primary/10">
                      <p className="text-xs font-black text-primary uppercase tracking-widest mb-2">Hint:</p>
                      <p className="text-sm italic font-medium text-on-surface-variant leading-relaxed">
                         "I've been a tailor in Lagos for 8 years. My goal is to buy an industrial overlock machine to hire three apprentices."
                      </p>
                   </div>

                   <Textarea 
                      placeholder="Start typing or tap the mic to speak..."
                      value={voiceInput.isListening ? `${formData.story} ${voiceInput.transcript}`.trim() : formData.story}
                      onChange={(e) => !voiceInput.isListening && setFormData({ ...formData, story: e.target.value })}
                      className="min-h-[250px] border-none bg-surface-variant/20 rounded-[2rem] p-8 text-lg font-medium shadow-inner focus:ring-0"
                   />
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
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
                          "w-full sm:w-auto flex items-center gap-3 px-8 py-4 rounded-full font-black text-sm uppercase tracking-widest transition-all shadow-xl",
                          voiceInput.isListening 
                            ? "bg-error text-white animate-pulse" 
                            : "bg-primary text-white hover:shadow-primary/30"
                        )}
                      >
                        {voiceInput.isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                        {voiceInput.isListening ? "Listening..." : "Tap to Speak"}
                      </button>
                   )}
                   
                   <span className={cn(
                     "text-sm font-black uppercase tracking-widest",
                     formData.story.split(/\s+/).filter(Boolean).length > 300 ? "text-error" : "text-on-surface-variant/60"
                   )}>
                     {(voiceInput.isListening ? `${formData.story} ${voiceInput.transcript}`.trim() : formData.story).split(/\s+/).filter(Boolean).length} / 300 Words
                   </span>
                </div>

                <Button 
                   onClick={nextStep} 
                   disabled={(!formData.story && !voiceInput.transcript)}
                   className="h-16 rounded-full text-lg w-full mt-4"
                >
                  Finalize My Profile
                </Button>
            </div>
          </motion.div>
        )

      case 5: // Terms & Submit
        return (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-xl mx-auto"
          >
            <div className="mb-12 text-center">
              <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-black uppercase tracking-widest mb-6 border border-primary/20">
                Phase 3: The Covenant
              </span>
              <h1 className="text-4xl font-black text-on-surface mb-4">The BuildBridge <span className="text-primary italic">Promise.</span></h1>
            </div>

            <div className="bg-white/70 backdrop-blur-xl p-8 rounded-[3rem] border border-white/50 shadow-2xl flex flex-col gap-8">
                <div className="space-y-6">
                    {[
                      { id: 1, text: "I commit to total transparency in my equipment requests." },
                      { id: 2, text: "I will provide photographic proof of every machine purchased." },
                      { id: 3, text: "I acknowledge that trust is my most valuable capital." }
                    ].map(rule => (
                      <div key={rule.id} className="flex gap-6 items-start">
                        <div className="h-10 w-10 shrink-0 rounded-2xl bg-primary text-white flex items-center justify-center font-black text-lg shadow-lg">
                           {rule.id}
                        </div>
                        <p className="text-on-surface font-bold leading-relaxed">{rule.text}</p>
                      </div>
                    ))}
                </div>

                <label className="flex items-center gap-4 bg-primary/5 p-6 rounded-[2rem] border-2 border-primary/10 cursor-pointer hover:bg-primary/10 transition-all select-none group">
                    <input 
                        type="checkbox" 
                        checked={formData.agreed_to_terms}
                        onChange={(e) => setFormData({ ...formData, agreed_to_terms: e.target.checked })}
                        className="h-7 w-7 rounded-lg border-primary text-primary focus:ring-primary cursor-pointer"
                    />
                    <span className="text-on-surface font-black uppercase tracking-wide text-xs group-hover:text-primary transition-colors">I accept the community terms</span>
                </label>

                {error && (
                    <div className="p-4 bg-error/5 border border-error/20 rounded-2xl text-error text-sm font-bold text-center">
                       {error}
                    </div>
                )}

                <Button 
                   onClick={handleSubmit} 
                   isLoading={loading} 
                   disabled={!formData.agreed_to_terms} 
                   className="h-20 rounded-[2.5rem] text-xl w-full bg-primary hover:shadow-2xl hover:shadow-primary/40 active:scale-95 transition-all flex items-center justify-center gap-4"
                >
                   <Rocket className="h-6 w-6" />
                   Launch My Journey
                </Button>
            </div>
          </motion.div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center relative bg-surface overflow-x-hidden pt-20 pb-12">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none">
        <div className={cn(
          "absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full blur-[150px] transition-all duration-1000",
          currentStep === 2 ? "bg-primary/40" : "bg-primary/10"
        )} />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-yellow-400/10 blur-[150px]" />
      </div>

      <div className="w-full max-w-7xl px-4 relative z-10">
        {/* Progress System */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-lg">
           <div className="flex justify-between items-center mb-4 px-2">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black shadow-inner">
                    {currentStep + 1}
                 </div>
                 <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary leading-none">Step</span>
                    <span className="text-sm font-black text-on-surface leading-none">{STEPS[currentStep].title}</span>
                 </div>
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/40">
                 {Math.round(((currentStep + 1) / STEPS.length) * 100)}% Complete
              </span>
           </div>
           <div className="h-1.5 w-full bg-surface-variant/30 rounded-full overflow-hidden backdrop-blur-sm">
             <motion.div 
               className="h-full bg-primary shadow-[0_0_20px_rgba(124,58,237,0.5)]"
               initial={{ width: 0 }}
               animate={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
               transition={{ duration: 0.5 }}
             />
           </div>
        </div>

        {/* Back control */}
        {currentStep > 0 && (
            <motion.button 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={prevStep}
              className="absolute left-4 top-14 sm:top-2 hover:translate-x-[-4px] transition-all flex items-center gap-2 text-xs font-black uppercase tracking-widest text-on-surface-variant hover:text-primary"
            >
                <ChevronLeft className="h-5 w-5" />
                Back
            </motion.button>
        )}

        {/* Step Content */}
        <div className="pt-24 min-h-[600px] flex items-center justify-center">
          <AnimatePresence mode="wait">
            <React.Fragment key={currentStep}>
              {renderStepContent()}
            </React.Fragment>
          </AnimatePresence>
        </div>
      </div>

      {/* Footer hint */}
      <footer className="mt-12 text-[10px] font-bold uppercase tracking-[0.3em] text-on-surface-variant/30">
        Pockets of trust building communities
      </footer>
    </div>
  )
}
