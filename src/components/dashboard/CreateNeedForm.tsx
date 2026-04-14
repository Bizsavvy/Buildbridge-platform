"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import { Input } from "@/components/ui/Input"
import { Textarea } from "@/components/ui/Textarea"
import { TRADE_ITEMS, DEFAULT_ITEMS } from "@/lib/data/need-items"
import { createNeedAction } from "@/app/dashboard/create-need/actions"
import { 
  Plus, 
  MapPin, 
  Camera, 
  ChevronLeft, 
  ArrowRight, 
  Calendar,
  CheckCircle2,
  Info,
  Mic,
  MicOff,
  Loader2
} from "lucide-react"
import { useVoiceInput } from "@/hooks/useVoiceInput"
import { cn } from "@/lib/utils"

interface CreateNeedFormProps {
  tradeCategory: string;
}

export function CreateNeedForm({ tradeCategory }: CreateNeedFormProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [loading, setLoading] = useState(false)
  
  // Form State
  const [formData, setFormData] = useState({
    item_name: "",
    custom_item: "",
    item_cost: "", // Store as string for masking
    photo_file: null as File | null,
    photo_url: "",
    geotag_lat: null as number | null,
    geotag_lng: null as number | null,
    story: "",
    impact_statement: "",
    deadline_days: 14,
    agreed_to_terms: false
  })

  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const voiceInput = useVoiceInput()

  const steps = [
    "Item",
    "Cost",
    "Photo",
    "Story",
    "Impact",
    "Timeline",
    "Confirm"
  ]

  // Steps handling
  const nextStep = () => {
    if (currentStep < steps.length - 1) {
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

  // Cost formatting helper
  const formatNGN = (val: string) => {
    const raw = val.replace(/[^0-9]/g, "")
    if (!raw) return ""
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 0
    }).format(parseInt(raw))
  }

  // Geolocation helper
  const captureLocation = () => {
    if (!navigator.geolocation) {
      setErrorMsg("Geolocation is not supported by your browser.")
      return
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setFormData(prev => ({ 
          ...prev, 
          geotag_lat: pos.coords.latitude, 
          geotag_lng: pos.coords.longitude 
        }))
        setErrorMsg(null)
      },
      (err) => {
        console.error("Geo error:", err)
        setErrorMsg("Please enable location services to verify your request.")
      }
    )
  }

  // Submission
  const handleSubmit = async () => {
    setLoading(true)
    setErrorMsg(null)
    
    try {
      const data = new FormData()
      data.append("item_name", formData.item_name)
      data.append("custom_item", formData.custom_item)
      data.append("item_cost", formData.item_cost)
      data.append("story", formData.story)
      data.append("impact_statement", formData.impact_statement)
      data.append("deadline_days", formData.deadline_days.toString())
      if (formData.photo_file) data.append("photo_file", formData.photo_file)
      if (formData.geotag_lat) data.append("geotag_lat", formData.geotag_lat.toString())
      if (formData.geotag_lng) data.append("geotag_lng", formData.geotag_lng.toString())

      const result = await createNeedAction(data)
      
      if (result.success) {
        router.refresh() // Clear router cache
        router.push("/dashboard?new_need=success")
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to create need.")
    } finally {
      setLoading(false)
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 0: // Item Selector
        const tradeSpecificItems = TRADE_ITEMS[tradeCategory] || DEFAULT_ITEMS
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-6">
            <div className="text-center">
              <h1 className="text-headline-medium text-primary font-bold mb-2">What do you need?</h1>
              <p className="text-body-large text-on-surface-variant">Select the tool or equipment for your business.</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {tradeSpecificItems.map((item) => (
                <button
                  key={item}
                  onClick={() => {
                    setFormData({ ...formData, item_name: item, custom_item: "" })
                    nextStep()
                  }}
                  className={cn(
                    "p-6 rounded-2xl border-2 text-left transition-all",
                    formData.item_name === item 
                      ? "border-primary bg-primary/5 text-primary" 
                      : "border-outline-variant hover:border-primary/50 text-on-surface hover:bg-surface"
                  )}
                >
                  <span className="text-title-medium font-bold">{item}</span>
                </button>
              ))}
              <button
                onClick={() => setFormData({ ...formData, item_name: "custom" })}
                className={cn(
                  "p-6 rounded-2xl border-2 text-left transition-all",
                  formData.item_name === "custom" 
                    ? "border-primary bg-primary/5 text-primary" 
                    : "border-outline-variant hover:border-primary/50 text-on-surface hover:bg-surface"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-surface-variant flex items-center justify-center">
                    <Plus className="h-5 w-5" />
                  </div>
                  <span className="text-title-medium font-bold">Something Else</span>
                </div>
              </button>
            </div>

            {formData.item_name === "custom" && (
              <Input 
                autoFocus
                placeholder="Enter item name..."
                label="Custom Item Name"
                value={formData.custom_item}
                onChange={(e) => setFormData({ ...formData, custom_item: e.target.value })}
              />
            )}

            {formData.item_name === "custom" && (
              <Button onClick={nextStep} disabled={!formData.custom_item} className="w-full">
                Continue
              </Button>
            )}
          </motion.div>
        )

      case 1: // Cost
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-8">
            <div className="text-center">
              <h1 className="text-headline-medium text-primary font-bold mb-2">How much does it cost?</h1>
              <p className="text-body-large text-on-surface-variant font-medium">Use the exact market price in Naira.</p>
            </div>

            <div className="flex flex-col gap-2">
              <div className="relative">
                <Input
                  className="h-20 text-display-small font-black text-center pl-4 pr-4"
                  value={formData.item_cost}
                  onChange={(e) => setFormData({ ...formData, item_cost: formatNGN(e.target.value) })}
                  placeholder="₦0"
                />
              </div>
              <div className="p-4 bg-badge-3/10 rounded-xl border border-badge-3/20 flex gap-3 items-start">
                  <Info className="h-5 w-5 text-badge-3 flex-shrink-0 mt-0.5" />
                  <p className="text-body-small text-on-surface">
                    <strong>Note:</strong> We will verify this price against market averages. Accurate pricing builds trust faster.
                  </p>
              </div>
            </div>

            <Button onClick={nextStep} disabled={!formData.item_cost || formData.item_cost === "₦0"} className="w-full h-16">
              Continue
            </Button>
          </motion.div>
        )

      case 2: // Photo & Location
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-8 items-center">
            <div className="text-center">
              <h1 className="text-headline-medium text-primary font-bold mb-2">Upload a photo</h1>
              <p className="text-body-large text-on-surface-variant">A photo of the item at the store or current equipment you're replacing.</p>
            </div>

            <div 
                className={cn(
                    "w-full aspect-video rounded-3xl border-2 border-dashed border-outline-variant bg-surface-variant/30 flex flex-col items-center justify-center relative overflow-hidden",
                    formData.photo_url && "border-solid border-primary"
                )}
            >
                {formData.photo_url ? (
                    <img src={formData.photo_url} className="w-full h-full object-cover" />
                ) : (
                    <div className="flex flex-col items-center gap-2">
                        <Camera className="h-12 w-12 text-on-surface-variant opacity-50" />
                        <span className="text-label-large text-on-surface-variant">Tap to take photo</span>
                    </div>
                )}
                <input 
                    type="file" 
                    className="absolute inset-0 opacity-0 cursor-pointer" 
                    accept="image/*" 
                    onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) setFormData(prev => ({ ...prev, photo_file: file, photo_url: URL.createObjectURL(file) }))
                    }} 
                />
            </div>

            <div className="w-full flex flex-col gap-4">
               <button 
                  onClick={captureLocation}
                  className={cn(
                      "flex items-center justify-center gap-3 p-4 rounded-xl border transition-all",
                      formData.geotag_lat ? "bg-badge-2 text-white border-badge-2" : "bg-surface border-outline-variant text-on-surface hover:border-primary"
                  )}
               >
                   <MapPin className="h-5 w-5" />
                   <span className="font-bold">
                       {formData.geotag_lat ? "Location Verified" : "Capture Location Tag"}
                   </span>
                   {formData.geotag_lat && <CheckCircle2 className="h-5 w-5" />}
               </button>
               
               {errorMsg && <p className="text-body-small text-error text-center font-medium">{errorMsg}</p>}

               <Button onClick={nextStep} disabled={!formData.photo_url || !formData.geotag_lat} className="w-full mt-2">
                 Continue
               </Button>
            </div>
          </motion.div>
        )

      case 3: // Story
        return (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-6">
                <div className="text-center">
                    <h2 className="text-headline-medium text-primary font-bold mb-2">Why do you need this?</h2>
                    <p className="text-body-large text-on-surface-variant">Explain how this specific item helps you work better.</p>
                </div>

                <div className="flex flex-col gap-4">
                    <div className="flex flex-wrap gap-2">
                        {["This tool will allow me to...", "Currently, I have to...", "With this, I can hire..."].map(starter => (
                            <button 
                                key={starter}
                                onClick={() => setFormData({ ...formData, story: starter + " " + formData.story })}
                                className="text-label-small bg-surface border border-outline-variant px-3 py-1.5 rounded-full hover:bg-primary/5 hover:border-primary transition-colors text-on-surface-variant"
                            >
                                + {starter}
                            </button>
                        ))}
                    </div>
                    <Textarea 
                        className="min-h-[180px]"
                        value={voiceInput.isListening && currentStep === 3 ? `${formData.story} ${voiceInput.transcript}`.trim() : formData.story}
                        onChange={(e) => {
                           if (!voiceInput.isListening) {
                              setFormData({ ...formData, story: e.target.value })
                           }
                        }}
                        placeholder="I've been a welder for 5 years. This machine will help me..."
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
                                "flex items-center gap-2 px-3 py-1.5 rounded-full font-bold transition-all",
                                voiceInput.isListening 
                                  ? "bg-error text-white animate-pulse shadow-md" 
                                  : "bg-surface border border-outline-variant text-on-surface hover:bg-surface-variant hover:text-primary"
                              )}
                            >
                              {voiceInput.isListening ? <><MicOff className="h-4 w-4" /> Stop Dictation</> : <><Mic className="h-4 w-4" /> Tap to Speak</>}
                            </button>
                          )}
                        </div>
                        <span className={cn("font-medium", formData.story.split(/\s+/).filter(Boolean).length > 150 ? "text-error" : "text-on-surface-variant")}>
                           {(voiceInput.isListening && currentStep === 3 ? `${formData.story} ${voiceInput.transcript}`.trim() : formData.story).split(/\s+/).filter(Boolean).length} / 150 words
                        </span>
                    </div>
                </div>

                <Button onClick={nextStep} disabled={(!formData.story && !(voiceInput.isListening && currentStep === 3)) || (voiceInput.isListening && currentStep === 3 ? `${formData.story} ${voiceInput.transcript}`.trim() : formData.story).split(/\s+/).filter(Boolean).length > 150} className="w-full mt-2">
                    Continue
                </Button>
            </motion.div>
        )

      case 4: // Impact
        return (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-8">
                <div className="text-center">
                    <h2 className="text-headline-medium text-primary font-bold mb-2">Impact Statement</h2>
                    <p className="text-body-large text-on-surface-variant">What is the direct result of this funding?</p>
                </div>

                <Card className="p-6 bg-surface-variant/50 border-outline-variant shadow-none">
                    <p className="text-body-medium text-on-surface mb-4">
                        <strong>Tip:</strong> Be specific. "Deliver orders 2 days faster" is better than "Work harder".
                    </p>
                    <Textarea 
                        label="Direct Impact"
                        placeholder="e.g. This will allow me to train two new apprentices this year."
                        value={voiceInput.isListening && currentStep === 4 ? `${formData.impact_statement} ${voiceInput.transcript}`.trim() : formData.impact_statement}
                        onChange={(e) => {
                           if (!voiceInput.isListening) {
                              setFormData({ ...formData, impact_statement: e.target.value })
                           }
                        }}
                    />
                    
                    {voiceInput.isSupported && (
                      <div className="mt-2 text-right">
                         <button 
                            onClick={() => {
                              if (voiceInput.isListening) {
                                voiceInput.stopListening();
                                setFormData(prev => ({ ...prev, impact_statement: `${prev.impact_statement} ${voiceInput.transcript}`.trim() }));
                              } else {
                                voiceInput.startListening();
                              }
                            }}
                            className={cn(
                              "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-label-small font-bold transition-all",
                              voiceInput.isListening 
                                ? "bg-error text-white animate-pulse shadow-md" 
                                : "bg-surface border border-outline-variant text-on-surface hover:bg-surface-variant hover:text-primary"
                            )}
                          >
                            {voiceInput.isListening ? <><MicOff className="h-4 w-4" /> Stop Dictation</> : <><Mic className="h-4 w-4" /> Tap to Speak</>}
                          </button>
                      </div>
                    )}
                    {/* TODO: Integrate DeepSeek AI for impact generation/polishing here */}
                </Card>

                <Button onClick={nextStep} disabled={!formData.impact_statement && !(voiceInput.isListening && currentStep === 4)} className="w-full mt-4">
                    Continue
                </Button>
            </motion.div>
        )

      case 5: // Timeline
        return (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-10">
                <div className="text-center">
                    <h2 className="text-headline-medium text-primary font-bold mb-2">Funding Deadline</h2>
                    <p className="text-body-large text-on-surface-variant font-medium">How many days do we keep the request active?</p>
                </div>

                <div className="flex flex-col gap-6 text-center">
                    <div className="flex items-center justify-center gap-4 text-display-medium font-black text-primary">
                        <Calendar className="h-10 w-10" />
                        <span>{formData.deadline_days} Days</span>
                    </div>
                    
                    <input 
                        type="range"
                        min="7"
                        max="30"
                        step="1"
                        value={formData.deadline_days}
                        onChange={(e) => setFormData({ ...formData, deadline_days: parseInt(e.target.value) })}
                        className="w-full h-3 bg-surface-variant rounded-full appearance-none cursor-pointer accent-primary"
                    />
                    
                    <div className="grid grid-cols-2 text-label-large text-on-surface-variant font-bold">
                        <span className="text-left">7 Days</span>
                        <span className="text-right">30 Days</span>
                    </div>
                </div>

                <Button onClick={nextStep} className="w-full">
                    Continue to Summary
                </Button>
            </motion.div>
        )

      case 6: // Summary
        return (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-8">
                <div className="text-center">
                    <h1 className="text-headline-medium text-primary font-bold mb-2">Review Summary</h1>
                    <p className="text-body-large text-on-surface-variant">Check everything before submitting for review.</p>
                </div>

                <Card className="divide-y divide-outline-variant overflow-hidden border-outline-variant shadow-md">
                    <div className="p-6 bg-surface">
                        <p className="text-label-small text-on-surface-variant uppercase font-bold tracking-widest mb-1">Requested Item</p>
                        <h4 className="text-headline-small font-black text-on-surface">{formData.item_name === "custom" ? formData.custom_item : formData.item_name}</h4>
                        <div className="mt-4 flex items-center justify-between">
                            <span className="text-display-small text-primary font-black">{formData.item_cost}</span>
                            <div className="flex items-center gap-1.5 text-badge-2 font-bold px-3 py-1 bg-badge-2/10 rounded-full">
                                <MapPin className="h-4 w-4" />
                                <span className="text-body-small">Geotagged</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="p-6 bg-surface-variant/30">
                         <div className="flex flex-col gap-4">
                            <div>
                                <p className="text-label-small text-on-surface-variant uppercase font-bold tracking-widest mb-1">Impact Plan</p>
                                <p className="text-body-medium text-on-surface italic">"{formData.impact_statement}"</p>
                            </div>
                            <div>
                                <p className="text-label-small text-on-surface-variant uppercase font-bold tracking-widest mb-1">Timeframe</p>
                                <p className="text-body-medium text-on-surface">{formData.deadline_days} days starting from today.</p>
                            </div>
                         </div>
                    </div>
                </Card>

                <div className="flex flex-col gap-4">
                    <div className="p-4 bg-badge-1/5 border border-badge-1/20 rounded-2xl flex gap-3">
                        <Info className="h-6 w-6 text-badge-1 flex-shrink-0 mt-0.5" />
                        <div className="flex flex-col gap-1">
                            <p className="text-label-large text-badge-1 font-bold">"Keep-what-you-raise" Disclosure</p>
                            <p className="text-body-small text-on-surface">
                                If you don't reach 100%, you still receive all funds raised minus fees, as long as you provide proof for the partial purchase.
                            </p>
                        </div>
                    </div>

                    <label className="flex items-center gap-3 cursor-pointer p-4 hover:bg-surface rounded-xl transition-colors">
                        <input 
                            type="checkbox" 
                            checked={formData.agreed_to_terms}
                            onChange={(e) => setFormData({ ...formData, agreed_to_terms: e.target.checked })}
                            className="h-6 w-6 rounded border-outline text-primary focus:ring-primary"
                        />
                        <span className="text-label-large text-on-surface">I confirm this information is accurate and honest.</span>
                    </label>

                    <Button onClick={handleSubmit} isLoading={loading} disabled={!formData.agreed_to_terms} className="w-full text-headline-small py-8">
                        Submit for Review
                    </Button>
                </div>
            </motion.div>
        )

      default:
        return null
    }
  }

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-8">
        <div className="mb-8 flex items-center gap-4">
            {currentStep > 0 && (
                <button onClick={prevStep} className="p-2 text-on-surface-variant hover:bg-surface-variant rounded-full transition-colors">
                    <ChevronLeft className="h-6 w-6" />
                </button>
            )}
            <div className="flex-grow">
                <div className="flex justify-between text-label-small text-on-surface-variant mb-2 font-bold uppercase tracking-widest">
                    <span>{steps[currentStep]}</span>
                    <span>Step {currentStep + 1} of {steps.length}</span>
                </div>
                <div className="h-1.5 w-full bg-surface-variant rounded-full overflow-hidden">
                    <motion.div 
                        className="h-full bg-primary"
                        initial={{ width: 0 }}
                        animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                    />
                </div>
            </div>
        </div>

        <AnimatePresence mode="wait">
            <React.Fragment key={currentStep}>
                {renderStep()}
            </React.Fragment>
        </AnimatePresence>
    </div>
  )
}
