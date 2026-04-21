"use client"

import * as React from "react"
import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Textarea } from "@/components/ui/Textarea"
import { Avatar } from "@/components/ui/Avatar"
import { createClient } from "@/lib/supabase/client"
import { 
  Scissors, Hammer, ChefHat, Flame, Watch, 
  Store, Zap, Droplets, Sparkles, Shirt,
  ChevronLeft, ChevronRight, Camera, Mic, MicOff, Loader2,
  Rocket, UserPlus, Phone, Mail, Play, CheckCircle
} from "lucide-react"
import { useVoiceInput } from "@/hooks/useVoiceInput"

import { NIGERIA_LOCATIONS } from "@/lib/data/nigeria"

const STEPS = [
  { id: "who_for", title: "Target" },
  { id: "amount", title: "Goal" },
  { id: "auth", title: "Account" },
  { id: "how_it_works", title: "Learn" },
  { id: "trade", title: "Craft" },
  { id: "location", title: "Roots" },
  { id: "photo", title: "Face" },
  { id: "story", title: "Story" },
  { id: "preview", title: "Preview" },
  { id: "terms", title: "Terms" },
  { id: "success", title: "Launched" }
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
  { id: "other", label: "Other", icon: UserPlus, color: "text-gray-500", bg: "bg-gray-100" },
]

export function OnboardingForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  
  const [currentStep, setCurrentStep] = useState(0)
  const [loading, setLoading] = useState(true)
  const [authMethod, setAuthMethod] = useState<"phone"|"email"|null>(null)
  const [otpSent, setOtpSent] = useState(false)
  const [otpCode, setOtpCode] = useState("")
  const [isGeneratingStory, setIsGeneratingStory] = useState(false)
   const [storyMethod, setStoryMethod] = useState<"write"|"ai">("write")
   const [carouselSlide, setCarouselSlide] = useState(0)

  const voiceInput = useVoiceInput()

  // Form State
  const [formData, setFormData] = useState({
    who_for: "", // "myself" or "someone_else"
    amount: "",
    name: "",
    phone: "",
    email: "",
    trade_category: "",
    custom_trade: "",
    location_state: "",
    location_lga: "",
    photo_url: "",
    photo_file: null as File | null,
    story: "",
    ai_prompts: { experience: "", product: "", community: "", equipment: "" },
    agreed_to_terms: false
  })

  // Initialize and check resume state
  useEffect(() => {
    console.log('Onboarding init, searchParams:', {
      resumedAuth: searchParams?.get('resumedAuth'),
      step: searchParams?.get('step')
    })
    
    const initSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      console.log('Session on init:', session ? 'exists' : 'null', session?.user?.email)
      
      const savedData = localStorage.getItem("onboarding_state")
      if (savedData) {
        setFormData(prev => ({...prev, ...JSON.parse(savedData)}))
      }

      let targetStep = 0
      
      if (session) {
        // If we came from Google OAuth redirect
        if (searchParams?.get("resumedAuth") === "true") {
          console.log('Resumed auth from Google OAuth, skipping to step 3')
          targetStep = 3
        } else {
           // Auto skip auth step if logged in
           console.log('Already logged in, skipping auth step')
           targetStep = 3
        }
      } else if (searchParams?.get("step")) {
         targetStep = parseInt(searchParams.get("step") || "0")
      }
      
      console.log('Setting currentStep to:', targetStep)
      setCurrentStep(targetStep)
      setLoading(false)
    }
    initSession()
    
    // Subscribe to auth state changes in case session loads later
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session ? 'session exists' : 'no session')
      if (session) {
        // If we get a session and we're still on auth steps (0-2), skip to step 3
        setCurrentStep(prev => prev < 3 ? 3 : prev)
        console.log('Auth state change: session detected, skipping to step 3 if needed')
      }
    })
    
    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // Redirect to dashboard if user already has a profile (already completed onboarding)
  useEffect(() => {
    const checkProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return
      
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', session.user.id)
        .maybeSingle()
      
      if (error) {
        console.error('Error checking profile:', error)
        return
      }
      
      if (profile) {
        console.log('User already has profile, redirecting to dashboard')
        router.push('/dashboard')
      }
    }
    
    checkProfile()
  }, [supabase, router])


  // Sync voice transcript with story
  const storyBaseRef = useRef("")
  useEffect(() => {
    if (voiceInput.isListening && voiceInput.transcript) {
      // Update formData.story with base + current transcript
      const newStory = `${storyBaseRef.current} ${voiceInput.transcript}`.trim()
      if (formData.story !== newStory) {
        setFormData(prev => ({ ...prev, story: newStory }))
      }
    }
  }, [voiceInput.transcript, voiceInput.isListening])

  // Check for OAuth errors from hash fragment
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const hash = window.location.hash;
    if (hash && hash.includes('error=')) {
      const params = new URLSearchParams(hash.slice(1));
      const error = params.get('error');
      const errorDescription = params.get('error_description');
      console.error('OAuth error from hash:', { error, errorDescription });
      
      let decodedError = errorDescription || error;
      if (decodedError) {
        // Decode URL-encoded characters (like %253A -> :, %252F -> /)
        try {
          decodedError = decodeURIComponent(decodedError.replace(/\+/g, ' '));
        } catch (e) {
          console.warn('Failed to decode error description:', e);
        }
      }
      
      alert(`Google OAuth failed: ${decodedError || 'Unknown error'}`);
      // Clear hash
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }
  }, [])

  const nextStep = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1)
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  const nextCarouselSlide = () => {
    if (carouselSlide < 2) {
      setCarouselSlide(prev => prev + 1)
    } else {
      nextStep()
    }
  }

  const prevCarouselSlide = () => {
    if (carouselSlide > 0) {
      setCarouselSlide(prev => prev - 1)
    }
  }

  const skipIntro = () => {
    setCarouselSlide(0)
    nextStep()
  }

  const handleGoogleAuth = async () => {
    setLoading(true)
    try {
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
      const redirectTo = `${baseUrl}/auth/callback?next=/onboarding&flow=signup`
      console.log('Google OAuth redirectTo:', redirectTo)
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo
        }
      })
    } catch (error) {
      console.error('Google OAuth error:', error)
      alert('Failed to sign in with Google. Please check your configuration and try again.')
      setLoading(false)
    }
  }

  const handleSendOTP = async () => {
    if (authMethod === "phone" && formData.phone) {
      setLoading(true)
      try {
        const res = await fetch("/api/auth/send-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone: formData.phone })
        })
        const data = await res.json()
        if (data.success) {
          setOtpSent(true)
        } else {
          alert(data.error || "Failed to send OTP")
        }
      } catch (err) {
        alert("Error sending OTP")
      } finally {
        setLoading(false)
      }
    } else if (authMethod === "email" && formData.email) {
      nextStep()
    }
  }

  const handleVerifyOTP = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: formData.phone, code: otpCode })
      })
      const data = await res.json()
      if (data.success) {
        nextStep()
      } else {
        alert(data.error || "Invalid verification code.")
      }
    } catch (err) {
      alert("Error verifying OTP")
    } finally {
      setLoading(false)
    }
  }

  const generateAIStory = async () => {
    setIsGeneratingStory(true)
    try {
      const res = await fetch("/api/generate-story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData.ai_prompts,
          isSelf: formData.who_for === "myself"
        })
      })
      const data = await res.json()
      if (data.success) {
        setFormData(prev => ({ ...prev, story: data.story }))
        setStoryMethod("write") // flip back to write to view the generated story
      } else {
        alert(data.error)
      }
    } catch (e) {
      alert("Failed to generate story. Please try again.")
    } finally {
      setIsGeneratingStory(false)
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

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary h-12 w-12" /></div>

  const renderStepContent = () => {
    switch (currentStep) {
       case 0:
        const isSelfSelection = formData.who_for === "myself"
        const isSomeoneElseSelection = formData.who_for === "someone_else"
        
        if (!formData.who_for) {
          return (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-2xl mx-auto">
              <h1 className="text-display-small sm:text-display-medium font-black text-on-surface mb-4 text-center">
                Who are you <span className="text-primary italic">fundraising for?</span>
              </h1>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <button 
                  onClick={() => setFormData({...formData, who_for: "myself"})}
                  className="group flex flex-col items-start justify-start gap-4 bg-surface-variant/20 border-2 border-outline-variant hover:border-primary p-8 rounded-3xl transition-all hover:bg-primary/5 active:scale-95 text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                      <UserPlus className="h-8 w-8 text-primary" />
                    </div>
                    <span className="text-headline-small font-black">Myself</span>
                  </div>
                  <p className="text-body-medium text-on-surface-variant pl-20">I am a tradesperson creating a need for my own business.</p>
                </button>
                <button 
                  onClick={() => setFormData({...formData, who_for: "someone_else"})}
                  className="group flex flex-col items-start justify-start gap-4 bg-surface-variant/20 border-2 border-outline-variant hover:border-primary p-8 rounded-3xl transition-all hover:bg-primary/5 active:scale-95 text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                      <UserPlus className="h-8 w-8 text-primary" />
                    </div>
                    <span className="text-headline-small font-black text-center">Someone else</span>
                  </div>
                  <p className="text-body-medium text-on-surface-variant pl-20">I want to create a need on behalf of a tradesperson I know.</p>
                </button>
              </div>
            </motion.div>
          )
        }
        
        // Who_for is selected, show name input
        return (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-lg mx-auto">
             <h1 className="text-display-small font-black text-on-surface mb-4 text-center">
              {isSelfSelection ? "What's your name?" : "What's the tradesperson's name?"}
            </h1>
            <p className="text-body-large text-on-surface-variant font-medium text-center mb-10">
              {isSelfSelection ? "This will appear on your profile and need cards." : "This will appear on the profile and need cards."}
            </p>
            
            <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-outline-variant/30 flex flex-col gap-6">
              <Input
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder={isSelfSelection ? "e.g. Ada Okoro" : "e.g. Chinedu Okafor"}
                className="h-20 text-center text-3xl font-black rounded-3xl border-2 border-outline-variant focus:border-primary placeholder:text-on-surface-variant/30"
                autoFocus
              />
              
              <Button 
                onClick={nextStep} 
                disabled={!formData.name.trim()} 
                className="h-16 rounded-full text-lg shadow-lg mt-4"
              >
                Continue
              </Button>
              
              <button 
                onClick={() => setFormData({...formData, who_for: ""})}
                className="text-sm font-bold text-on-surface-variant uppercase tracking-widest hover:text-primary"
              >
                ← Back to selection
              </button>
            </div>
          </motion.div>
        )
      
       case 1:
        const amt = parseInt(formData.amount.replace(/[^0-9]/g, "") || "0")
        return (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-lg mx-auto">
             <h1 className="text-display-small font-black text-on-surface mb-4 text-center">
              How much do you <span className="text-primary italic">need to raise?</span>
            </h1>
            <p className="text-body-large text-on-surface-variant font-medium text-center mb-10">
              Enter the exact cost of the item or service you need. Be as precise as you can — specific amounts build more trust with backers.
            </p>
            <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-outline-variant/30 flex flex-col gap-6">
               <Input 
                  value={formData.amount}
                  onChange={(e) => {
                    const clean = e.target.value.replace(/[^0-9]/g, "")
                    if (clean) {
                      const formatted = new Intl.NumberFormat("en-NG").format(parseInt(clean))
                      setFormData({...formData, amount: formatted})
                    } else {
                       setFormData({...formData, amount: ""})
                    }
                  }}
                  placeholder="e.g. ₦35,000"
                  className="h-20 text-center text-4xl font-black rounded-3xl border-2 border-outline-variant focus:border-primary placeholder:text-on-surface-variant/30"
               />
                
                {amt > 0 && (
                   <div className="p-4 bg-badge-1/10 rounded-2xl border border-badge-1/20 text-sm font-medium text-badge-1 text-center animate-in fade-in slide-in-from-bottom-2">
                      {amt <= 20000 
                         ? "This need qualifies for Level 0 listing. You can raise this amount right away."
                         : amt <= 50000 
                         ? "You will need at least 3 community vouches (Level 1) to list this amount."
                         : amt <= 150000 
                         ? "You will need Level 2 verification — identity check and 5 community vouches."
                         : amt <= 500000 
                         ? "You will need Level 3 — a community leader endorsement and 10 vouches."
                         : "Needs above ₦500,000 require full Platform Verification (Level 4) by the BuildBridge team."}
                   </div>
                )}

                <Button disabled={amt === 0} onClick={nextStep} className="h-16 rounded-full text-lg shadow-lg hover:shadow-xl mt-4">
                  Continue →
                </Button>
            </div>
          </motion.div>
        )

      case 2: // Auth
        return (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md mx-auto text-center">
             <h1 className="text-display-small font-black text-on-surface mb-4">
               Create your <br/><span className="text-primary italic">account.</span>
             </h1>
             <p className="text-body-large text-on-surface-variant font-medium mb-10">Save your progress and get your need in front of backers.</p>
            
            <div className="flex flex-col gap-4">
              <Button onClick={handleGoogleAuth} className="h-16 rounded-2xl bg-surface border-2 border-outline-variant text-on-surface hover:bg-surface-variant justify-center gap-3 font-bold text-lg shadow-sm">
                 <svg width="24" height="24" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                 Continue with Google
              </Button>
              <div className="relative flex items-center py-4">
                 <div className="flex-grow border-t border-outline-variant/50"></div>
                 <span className="flex-shrink-0 mx-4 text-on-surface-variant text-label-small font-bold uppercase tracking-widest">OR</span>
                 <div className="flex-grow border-t border-outline-variant/50"></div>
              </div>
              
              {authMethod === null ? (
                <div className="grid grid-cols-2 gap-4">
                    <Button onClick={() => setAuthMethod("phone")} variant="secondary" className="h-14 rounded-2xl justify-center gap-2 border-2 border-outline-variant bg-transparent">
                      <Phone className="h-5 w-5" /> Continue with phone →
                    </Button>
                    <Button onClick={() => setAuthMethod("email")} variant="secondary" className="h-14 rounded-2xl justify-center gap-2 border-2 border-outline-variant bg-transparent">
                      <Mail className="h-5 w-5" /> Continue with email →
                    </Button>
                </div>
              ) : (
                <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-top-4">
                   {!otpSent ? (
                     <>
                       <Input 
                          placeholder={authMethod === "phone" ? "080 123 4567" : "Email address"}
                          value={authMethod === "phone" ? formData.phone : formData.email}
                          onChange={e => authMethod === "phone" ? setFormData({...formData, phone: e.target.value}) : setFormData({...formData, email: e.target.value})}
                          className="h-14 rounded-2xl text-center text-lg font-bold"
                       />
                       <Button onClick={handleSendOTP} disabled={authMethod === "phone" ? !formData.phone : !formData.email} className="h-14 rounded-2xl">
                         Send Verification Code
                       </Button>
                       <button onClick={() => setAuthMethod(null)} className="text-sm font-bold text-on-surface-variant hover:text-primary mt-2">
                          Go Back
                       </button>
                     </>
                   ) : (
                     <>
                       <p className="text-sm font-medium text-on-surface-variant mb-2">
                         Enter the code sent to {formData.phone}
                       </p>
                       <Input 
                          placeholder="000000"
                          value={otpCode}
                          onChange={e => setOtpCode(e.target.value)}
                          className="h-14 rounded-2xl text-center text-2xl font-black tracking-widest"
                          maxLength={6}
                       />
                       <Button onClick={handleVerifyOTP} disabled={otpCode.length < 4} className="h-14 rounded-2xl">
                         Verify & Continue
                       </Button>
                       <button onClick={() => setOtpSent(false)} className="text-sm font-bold text-on-surface-variant hover:text-primary mt-2">
                          Change Phone Number
                       </button>
                     </>
                   )}
                </div>
              )}
            </div>
          </motion.div>
        )

      case 3: // Carousel
        const isSelfCarousel = formData.who_for === "myself"
        const slides = [
          {
            emoji: "🛠️",
            title: "Create the need",
            description: isSelfCarousel 
              ? "Tell us what is needed and why. Add a photo and a short story. It takes less than 5 minutes."
              : "Tell us what your tradesperson needs and why. Add a photo and a short story. It takes less than 5 minutes."
          },
          {
            emoji: "🤝",
            title: "The community steps in",
            description: "Neighbours, market friends, family abroad — anyone can back a need directly from their phone."
          },
          {
            emoji: "💸",
            title: "The money goes straight to the tradesperson",
            description: "Every Naira pledged goes directly to them — even if the full target isn't reached."
          }
        ]
        return (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-xl mx-auto text-center">
            <h1 className="text-display-small font-black text-on-surface mb-8">How it <span className="text-primary italic">Works</span></h1>
            <div className="bg-white p-8 rounded-[3rem] shadow-2xl border border-outline-variant/30 flex flex-col gap-8 min-h-[400px]">
              {/* Slide Content */}
              <div className="flex-1 flex flex-col items-center justify-center">
                <div className="text-6xl mb-6">{slides[carouselSlide].emoji}</div>
                <h3 className="text-title-large font-black text-on-surface mb-4">{slides[carouselSlide].title}</h3>
                <p className="text-body-large text-on-surface-variant font-medium">{slides[carouselSlide].description}</p>
                
                {/* Success story card on last slide */}
                {carouselSlide === 2 && (
                  <div className="mt-8 p-4 bg-surface-variant/30 rounded-2xl border border-outline-variant/30 w-full">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">📸</span>
                      <div className="text-left">
                        <p className="font-bold text-on-surface">See how Ada funded her oven repair in 3 days</p>
                        <button className="text-primary font-bold text-sm hover:underline">View story →</button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Progress dots */}
              <div className="flex items-center justify-center gap-3 mt-6">
                {slides.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCarouselSlide(idx)}
                    className={`h-3 w-3 rounded-full transition-all ${idx === carouselSlide ? "bg-primary scale-110" : "bg-outline-variant"}`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>
              
              {/* Navigation buttons */}
              <div className="flex items-center gap-4 mt-6">
                <Button 
                  onClick={prevCarouselSlide} 
                  disabled={carouselSlide === 0}
                  variant="secondary" 
                  className="flex-1 h-14 rounded-full"
                >
                  <ChevronLeft className="h-5 w-5" /> Back
                </Button>
                <Button 
                  onClick={nextCarouselSlide} 
                  className="flex-1 h-14 rounded-full"
                >
                  {carouselSlide < 2 ? "Next" : "Get started →"}
                </Button>
              </div>
              
              {/* Skip intro link */}
              <button 
                onClick={skipIntro} 
                className="text-sm font-bold text-on-surface-variant uppercase tracking-widest hover:text-primary mt-4"
              >
                Skip intro
              </button>
            </div>
          </motion.div>
        )

       case 4: // Trade
        const isSelf = formData.who_for === "myself"
        return (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-4xl mx-auto">
            <h1 className="text-display-small font-black text-on-surface mb-4 text-center">
              {isSelf ? "What is your trade?" : "What is their trade?"}
            </h1>
            <p className="text-body-large text-on-surface-variant font-medium text-center mb-10">Pick the one that best describes the work.</p>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {TRADE_CATEGORIES.map((trade) => (
                <button
                  key={trade.id}
                  onClick={() => {
                    setFormData({ ...formData, trade_category: trade.id })
                    if (trade.id !== 'other') setTimeout(nextStep, 300)
                  }}
                  className={`flex flex-col items-center justify-center aspect-square p-4 rounded-[2rem] border-2 transition-all overflow-hidden ${formData.trade_category === trade.id ? "border-primary bg-primary text-white shadow-xl shadow-primary/30" : "border-outline-variant bg-white/50 hover:bg-white"}`}
                >
                  <trade.icon className={`h-10 w-10 mb-3 transition-transform ${formData.trade_category === trade.id ? "text-white scale-110" : trade.color}`} />
                  <span className="text-xs font-black uppercase tracking-widest text-center">{trade.label}</span>
                </button>
              ))}
            </div>
            {formData.trade_category === 'other' && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-8">
                <Input
                  placeholder="Describe the trade"
                  value={formData.custom_trade}
                  onChange={(e) => setFormData({ ...formData, custom_trade: e.target.value })}
                  className="h-16 rounded-2xl border-2 border-outline-variant text-center text-lg"
                />
                <Button onClick={nextStep} disabled={!formData.custom_trade.trim()} className="h-16 rounded-full text-lg w-full mt-6">
                  Continue
                </Button>
              </motion.div>
            )}
          </motion.div>
        )

       case 5: // Location
        const isSelfLocation = formData.who_for === "myself"
        return (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-lg mx-auto">
             <h1 className="text-display-small font-black text-on-surface mb-4 text-center">
               {isSelfLocation ? "Where are you based?" : "Where is the tradesperson based?"}
             </h1>
             <p className="text-body-large text-on-surface-variant font-medium text-center mb-10">This helps backers find tradespeople in their area.</p>
            <div className="bg-white/70 p-8 rounded-[3rem] shadow-xl border border-outline-variant/30 flex flex-col gap-6">
              <select value={formData.location_state} onChange={(e) => setFormData({ ...formData, location_state: e.target.value, location_lga: "" })} className="h-16 w-full rounded-2xl border-2 border-outline-variant bg-white px-6 font-bold text-lg outline-none appearance-none cursor-pointer">
                <option value="">Select State</option>
                {Object.keys(NIGERIA_LOCATIONS).map((state) => (
                  <option key={state} value={state}>{state.charAt(0).toUpperCase() + state.slice(1).replace("_", " ")}</option>
                ))}
              </select>
              <select disabled={!formData.location_state} value={formData.location_lga} onChange={(e) => setFormData({ ...formData, location_lga: e.target.value })} className="h-16 w-full rounded-2xl border-2 border-outline-variant bg-white px-6 font-bold text-lg outline-none disabled:opacity-50 cursor-pointer">
                <option value="">Select Local Area</option>
                {formData.location_state && NIGERIA_LOCATIONS[formData.location_state].map((lga) => (
                  <option key={lga} value={lga}>{lga}</option>
                ))}
              </select>
              <Button disabled={!formData.location_state || !formData.location_lga} onClick={nextStep} className="h-16 rounded-full text-lg w-full mt-4">Continue</Button>
            </div>
          </motion.div>
        )

       case 6: // Photo
        const isSelfPhoto = formData.who_for === "myself"
        return (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md mx-auto text-center">
             <h1 className="text-display-small font-black text-on-surface mb-4">
               {isSelfPhoto ? "Add a photo of yourself" : "Add a photo of the tradesperson"}
             </h1>
             <p className="text-body-large text-on-surface-variant font-medium mb-10">A clear face photo helps backers feel confident about who they are backing.</p>
            <div className="relative inline-block mb-10">
               <Avatar src={formData.photo_url} name={formData.name || "Artisan"} className="h-56 w-56 border-8 border-white shadow-2xl relative" />
              <label className="absolute bottom-2 right-2 bg-primary text-white p-4 rounded-full shadow-xl cursor-pointer hover:scale-110 transition-all border-4 border-white">
                <Camera className="h-6 w-6" />
                <input type="file" className="hidden" accept="image/*" onChange={handlePhotoChange} />
              </label>
            </div>
             <div className="mb-8 p-4 bg-surface-variant/30 rounded-2xl border border-outline-variant/30">
               <div className="flex items-center gap-2 text-label-small font-bold text-on-surface-variant mb-2">
                 <span className="text-badge-1">✅ Good:</span> <span>face clearly visible, good lighting</span>
               </div>
               <div className="flex items-center gap-2 text-label-small font-bold text-on-surface-variant">
                 <span className="text-badge-3">❌ Avoid:</span> <span>group photos, blurry images, logos</span>
               </div>
             </div>
             <div className="flex flex-col gap-4">
               <Button onClick={nextStep} disabled={!formData.photo_url} className="h-16 rounded-full text-lg w-full">Continue</Button>
               <button onClick={nextStep} className="text-sm font-bold text-on-surface-variant uppercase tracking-widest hover:text-primary">Skip for now</button>
             </div>
          </motion.div>
        )

       case 7: // Story (Multi-tab)
        const isSelfStory = formData.who_for === "myself"
        return (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-2xl mx-auto">
            <h1 className="text-display-small font-black text-on-surface mb-4 text-center">
              {isSelfStory ? "Tell people about your work" : `Tell people about ${formData.name || "the tradesperson"}'s work`}
            </h1>
            <p className="text-body-large text-on-surface-variant font-medium text-center mb-8">This is the first thing backers will read. Write it or let AI help you get started.</p>
            
            <div className="bg-white rounded-[3rem] shadow-2xl border border-outline-variant/30 overflow-hidden">
               <div className="flex border-b border-outline-variant/30 bg-surface-variant/10">
                  <button onClick={() => setStoryMethod("write")} className={`flex-1 py-4 text-sm font-black uppercase tracking-widest transition-colors ${storyMethod === "write" ? "border-b-2 border-primary text-primary" : "text-on-surface-variant hover:text-on-surface"}`}>Write</button>
                  <button onClick={() => setStoryMethod("ai")} className={`flex-1 py-4 text-sm font-black uppercase tracking-widest transition-colors ${storyMethod === "ai" ? "border-b-2 border-primary text-primary" : "text-on-surface-variant hover:text-on-surface"}`}>Generate (AI)</button>
               </div>
               
               <div className="p-8">
               {storyMethod === "write" ? (
                  <div className="flex flex-col gap-4">
                     <p className="text-sm font-medium text-on-surface-variant mb-2">Speak from the heart. Tell backers why this equipment matters.</p>
                     <div className="relative">
                         <Textarea 
                            placeholder="I have been a baker for 5 years..."
                            value={voiceInput.isListening ? `${storyBaseRef.current} ${voiceInput.transcript}`.trim() : formData.story}
                            onChange={(e) => !voiceInput.isListening && setFormData({...formData, story: e.target.value})}
                            className="h-48 rounded-3xl border-2 border-outline-variant p-6 p-b-14 text-lg w-full"
                         />
                         {voiceInput.isSupported && (
                            <button 
                              onClick={() => {
                                if (voiceInput.isListening) {
                                  voiceInput.stopListening();
                                } else {
                                  storyBaseRef.current = formData.story;
                                  voiceInput.startListening();
                                }
                              }}
                              className={`absolute bottom-4 right-4 p-3 rounded-full flex items-center justify-center transition-all shadow-md ${voiceInput.isListening ? 'bg-error text-white animate-pulse' : 'bg-primary/10 text-primary hover:bg-primary/20'}`}
                            >
                              {voiceInput.isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                            </button>
                         )}
                     </div>
                  </div>
               ) : (
                  <div className="flex flex-col gap-6">
                     <p className="text-sm font-medium text-on-surface-variant mb-2">Answer 3 simple questions and our AI will craft a beautiful story for you.</p>
                     <div className="flex flex-col gap-2">
                        <label className="text-xs font-black uppercase tracking-widest">How many years of experience?</label>
                        <Input value={formData.ai_prompts.experience} onChange={e => setFormData({...formData, ai_prompts: {...formData.ai_prompts, experience: e.target.value}})} placeholder="e.g. 5 years" className="h-14 rounded-2xl"/>
                     </div>
                     <div className="flex flex-col gap-2">
                        <label className="text-xs font-black uppercase tracking-widest">What do you make/do?</label>
                        <Input value={formData.ai_prompts.product} onChange={e => setFormData({...formData, ai_prompts: {...formData.ai_prompts, product: e.target.value}})} placeholder="e.g. Wedding cakes and pastries" className="h-14 rounded-2xl"/>
                     </div>
                     <div className="flex flex-col gap-2">
                        <label className="text-xs font-black uppercase tracking-widest">Who do you serve in your community?</label>
                        <Input value={formData.ai_prompts.community} onChange={e => setFormData({...formData, ai_prompts: {...formData.ai_prompts, community: e.target.value}})} placeholder="e.g. Local schools and families" className="h-14 rounded-2xl"/>
                     </div>
                     <div className="flex flex-col gap-2">
                        <label className="text-xs font-black uppercase tracking-widest">What equipment do you need?</label>
                        <Input value={formData.ai_prompts.equipment} onChange={e => setFormData({...formData, ai_prompts: {...formData.ai_prompts, equipment: e.target.value}})} placeholder="e.g. Industrial Sewing Machine" className="h-14 rounded-2xl"/>
                     </div>
                     <Button 
                        onClick={generateAIStory} 
                        disabled={!formData.ai_prompts.experience || !formData.ai_prompts.product || !formData.ai_prompts.community || !formData.ai_prompts.equipment}
                        isLoading={isGeneratingStory}
                        className="h-16 rounded-2xl mt-4 font-black"
                     >
                        <Sparkles className="mr-2 h-5 w-5"/> Generate My Story
                     </Button>
                  </div>
               )}
               </div>
            </div>
             {(storyMethod === "write" || formData.story) && (
               <Button onClick={nextStep} disabled={!formData.story} className="h-16 rounded-full text-lg w-full mt-6 shadow-xl">
                 Review Profile
               </Button>
             )}
          </motion.div>
        )

       case 8: // Preview
        const isSelfPreview = formData.who_for === "myself"
        const trade = TRADE_CATEGORIES.find(t => t.id === formData.trade_category)
        const tradeLabel = trade ? trade.label : (formData.custom_trade || "Unknown Trade")
        const TradeIcon = trade ? trade.icon : UserPlus
        const tradeColor = trade ? trade.color : "text-gray-500"
        
        // Format amount with thousands separators
        const formattedAmount = formData.amount 
          ? new Intl.NumberFormat("en-NG").format(parseInt(formData.amount.replace(/[^0-9]/g, "") || "0"))
          : "0"
        
        // Format state name (snake_case to Title Case)
        const formatStateName = (state: string) => {
          if (!state) return ""
          return state
            .replace(/_/g, " ")
            .split(" ")
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(" ")
        }
        const formattedState = formData.location_state ? formatStateName(formData.location_state) : ""
        
        return (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-xl mx-auto">
            <h1 className="text-display-small font-black text-on-surface mb-4 text-center">Here's what backers will see</h1>
            <p className="text-body-large text-on-surface-variant font-medium text-center mb-8">This is the public profile. Everything can be updated later.</p>
            
            <div className="bg-white rounded-[3rem] shadow-2xl border border-outline-variant/30 p-8 flex flex-col gap-8">
               {/* Profile Header */}
               <div className="flex items-center gap-6 border-b border-outline-variant/30 pb-8">
                  <Avatar src={formData.photo_url} name={formData.name || "Artisan"} className="h-24 w-24 rounded-3xl border-4 border-white shadow-lg" />
                  <div className="flex-1">
                     <h2 className="text-3xl font-black mb-1">{formData.name || "Artisan"}</h2>
                     <div className="flex items-center gap-2 mb-2">
                        <TradeIcon className={`h-5 w-5 ${tradeColor}`} />
                        <span className="font-bold text-on-surface">{tradeLabel}</span>
                     </div>
                     <p className="text-on-surface-variant font-medium">
                        {formData.location_lga && formattedState 
                          ? `${formData.location_lga}, ${formattedState}` 
                          : "Location not set"}
                     </p>
                  </div>
               </div>
               
               {/* Verification & Vouch Status */}
               <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-badge-1/10 border border-badge-1/20 rounded-2xl">
                     <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">🟡</span>
                        <h3 className="font-black text-badge-1">Level 0 — Verified</h3>
                     </div>
                     <p className="text-label-small text-on-surface-variant">Phone / Email verified</p>
                  </div>
                  <div className="p-4 bg-surface-variant/20 border border-outline-variant/30 rounded-2xl">
                     <h3 className="font-black text-on-surface mb-2">Vouches</h3>
                     <p className="text-label-small text-on-surface-variant">0 vouches so far</p>
                  </div>
               </div>
               
               {/* Attribution Note (if Someone Else) */}
               {!isSelfPreview && formData.name && (
                 <div className="p-4 bg-primary/5 border border-primary/20 rounded-2xl">
                    <p className="text-label-small text-on-surface">
                       <span className="font-bold">Note:</span> This need was created by you on behalf of {formData.name}.
                    </p>
                 </div>
               )}
               
               {/* Fundraising Goal */}
               <div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-primary mb-2">Fundraising Goal</h3>
                  <p className="text-4xl font-black">₦{formattedAmount}</p>
               </div>
               
               {/* Personal Story */}
               <div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-primary mb-2">The Story</h3>
                  <div className="p-4 bg-surface-variant/10 rounded-2xl border border-outline-variant/30">
                     <p className="text-on-surface leading-relaxed whitespace-pre-wrap">
                        {formData.story || "No story added yet."}
                     </p>
                  </div>
               </div>
            </div>
            
            {/* Actions */}
            <div className="flex flex-col gap-4 mt-8">
               <Button onClick={nextStep} className="h-16 rounded-full text-lg w-full shadow-xl">
                  Looks good — continue →
               </Button>
               <button 
                  onClick={() => setCurrentStep(7)} // Go back to story screen to edit
                  className="text-sm font-bold text-on-surface-variant hover:text-primary text-center"
               >
                  Edit something
               </button>
            </div>
          </motion.div>
        )

      case 9: // Terms
        return (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-xl mx-auto text-center">
             <h1 className="text-display-small font-black text-on-surface mb-8 text-center">The <span className="text-primary italic">Covenant.</span></h1>
             <div className="bg-white p-8 rounded-[3rem] shadow-2xl border border-outline-variant/30 flex flex-col gap-6 text-left">
                {[
                  "I commit to total transparency in my equipment requests.",
                  "I will provide photographic proof of every machine purchased.",
                  "I acknowledge that trust is my most valuable capital."
                ].map((term, i) => (
                  <div key={i} className="flex gap-4">
                     <CheckCircle className="h-6 w-6 text-primary flex-shrink-0" />
                     <p className="font-bold text-on-surface">{term}</p>
                  </div>
                ))}
                
                <label className="flex items-center gap-4 bg-primary/5 p-6 rounded-2xl border-2 border-primary/20 cursor-pointer mt-4">
                   <input type="checkbox" checked={formData.agreed_to_terms} onChange={e => setFormData({...formData, agreed_to_terms: e.target.checked})} className="h-6 w-6 rounded border-primary text-primary focus:ring-primary"/>
                   <span className="font-black text-sm uppercase tracking-widest">I Accept and Commit</span>
                </label>
             </div>
             <Button onClick={() => { localStorage.removeItem("onboarding_state"); nextStep() }} disabled={!formData.agreed_to_terms} className="h-16 rounded-full text-lg w-full mt-8 shadow-xl bg-primary"><Rocket className="mr-2 h-5 w-5"/> Launch My Goal</Button>
          </motion.div>
        )
      
       case 10: // Success
        return (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-2xl mx-auto text-center">
             <div className="h-28 w-28 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-green-500/30">
               <CheckCircle className="h-14 w-14 text-white" />
             </div>
             <h1 className="text-display-medium font-black text-on-surface mb-4">The profile is live! 🎉</h1>
             <p className="text-body-large text-on-surface-variant font-medium mb-10">You are now a BuildBridge member.</p>
             
             {/* Verification Badge */}
             <div className="mb-10 p-6 bg-badge-1/10 border border-badge-1/20 rounded-3xl">
               <div className="flex items-center justify-center gap-3 mb-4">
                 <span className="text-2xl">🟡</span>
                 <h3 className="text-title-large font-black text-badge-1">Level 0 — Verified</h3>
               </div>
               <p className="text-body-medium text-on-surface-variant">Backers can see that this account is confirmed.</p>
             </div>
             
             {/* Verification Journey */}
             <div className="mb-10">
               <h4 className="text-headline-small font-black text-on-surface mb-6">Verification Journey</h4>
               <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                 <div className="p-4 border border-outline-variant/30 rounded-2xl bg-surface">
                   <div className="text-label-small font-bold uppercase text-badge-1 mb-2">Level 1</div>
                   <div className="text-title-medium font-black text-on-surface mb-2">Community Member</div>
                   <ul className="text-label-small text-on-surface-variant list-disc list-inside space-y-1">
                     <li>3 vouches</li>
                     <li>₦50,000 cap</li>
                   </ul>
                 </div>
                 <div className="p-4 border border-outline-variant/30 rounded-2xl bg-surface">
                   <div className="text-label-small font-bold uppercase text-badge-2 mb-2">Level 2</div>
                   <div className="title-medium font-black text-on-surface mb-2">Trusted Tradesperson</div>
                   <ul className="text-label-small text-on-surface-variant list-disc list-inside space-y-1">
                     <li>5 vouches</li>
                     <li>Geotagged workspace</li>
                     <li>₦150,000 cap</li>
                   </ul>
                 </div>
                 <div className="p-4 border border-outline-variant/30 rounded-2xl bg-surface">
                   <div className="text-label-small font-bold uppercase text-badge-3 mb-2">Level 3</div>
                   <div className="title-medium font-black text-on-surface mb-2">Established</div>
                   <ul className="text-label-small text-on-surface-variant list-disc list-inside space-y-1">
                     <li>10 vouches</li>
                     <li>Community leader endorsement</li>
                     <li>₦500,000 cap</li>
                   </ul>
                 </div>
                 <div className="p-4 border border-outline-variant/30 rounded-2xl bg-surface">
                   <div className="text-label-small font-bold uppercase text-badge-4 mb-2">Level 4</div>
                   <div className="title-medium font-black text-on-surface mb-2">Platform Verified</div>
                   <ul className="text-label-small text-on-surface-variant list-disc list-inside space-y-1">
                     <li>Full review by BuildBridge team</li>
                     <li>No funding cap</li>
                   </ul>
                 </div>
               </div>
             </div>
             
             {/* Callout Card */}
             <div className="mb-10 p-6 bg-primary/5 border border-primary/20 rounded-3xl">
               <div className="flex items-start gap-4">
                 <span className="text-2xl">💡</span>
                 <div>
                   <h4 className="text-headline-small font-black text-on-surface mb-2">Get vouches to unlock higher levels</h4>
                   <p className="text-body-medium text-on-surface-variant">Ask 3 people who know this work to vouch for them — a neighbour, a customer, or a fellow trader. Vouching takes less than 2 minutes on their phone.</p>
                 </div>
               </div>
             </div>
             
             {/* Actions */}
             <div className="flex flex-col sm:flex-row gap-4">
               <Button onClick={() => router.push("/dashboard/create-need")} className="h-16 rounded-full text-lg flex-1">
                 Create your first need →
               </Button>
               <Button variant="secondary" className="h-16 rounded-full text-lg flex-1">
                 Get vouches first
               </Button>
             </div>
          </motion.div>
        )
    }
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center relative overflow-hidden bg-surface py-20 px-4">
       <div className="fixed top-0 left-0 w-full h-[600px] bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
       
       <div className="w-full max-w-7xl relative z-10">
         {/* Progress Bar Header */}
         {currentStep < 10 && (
           <div className="flex flex-col gap-4 mb-16 mx-auto max-w-md">
             <div className="flex items-center justify-between">
                {currentStep > 0 && (
                  <button onClick={prevStep} className="flex items-center gap-1 text-sm font-black uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors">
                     <ChevronLeft className="h-4 w-4" /> Back
                  </button>
                )}
                 <span className="text-xs font-black uppercase tracking-widest text-primary flex-grow text-right">
                   Step {currentStep + 1} of 11
                 </span>
             </div>
             <div className="h-2 w-full bg-surface-variant/50 rounded-full overflow-hidden">
               <motion.div 
                 className="h-full bg-primary"
                 initial={{ width: 0 }}
                  animate={{ width: `${((currentStep + 1) / 11) * 100}%` }}
               />
             </div>
           </div>
         )}

         {/* Main Content */}
         <div className="min-h-[500px] flex items-center justify-center">
            <AnimatePresence mode="wait">
               <React.Fragment key={currentStep}>
                  {renderStepContent()}
               </React.Fragment>
            </AnimatePresence>
         </div>
       </div>
    </div>
  )
}
