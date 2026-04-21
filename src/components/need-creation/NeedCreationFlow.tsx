"use client"

import * as React from "react"
import { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { NIGERIA_LOCATIONS } from "@/lib/data/nigeria"
import { ChevronLeft, ChevronRight, Camera, Mic, Loader2, ShieldCheck, CheckCircle, X } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { adminSyncPhoneUser } from "@/app/actions/auth"
// Steps based on Sign-Up.md specification
const STEPS = [
  { id: "location_trade", title: "Location & Trade", leftHeading: "Let's begin your fundraising journey", leftSubtext: "We're here to guide you every step of the way." },
  { id: "who_for", title: "Who Are You Raising For?", leftHeading: "Who are you fundraising for?", leftSubtext: "You can create a need for yourself or on behalf of a tradesperson in your community." },
  { id: "goal_amount", title: "Goal Amount", leftHeading: "Set your fundraising goal", leftSubtext: "Enter the exact cost of the item or service. Specific amounts build more trust with backers." },
  { id: "create_account", title: "Create Your Account", leftHeading: "Create your account", leftSubtext: "Save your progress and get your need live for backers to find." },
  { id: "otp_verification", title: "OTP Verification", leftHeading: "Check your messages", leftSubtext: "We sent a confirmation code to your phone. Enter it below to continue." },
  { id: "how_it_works", title: "How BuildBridge Works", leftHeading: "Here's how it works", leftSubtext: "Three simple steps — and your community does the rest." },
  { id: "cover_photo", title: "Cover Photo", leftHeading: "Add a cover photo", leftSubtext: "A great photo is the first thing backers notice. Make it count." },
  { id: "the_story", title: "The Story", leftHeading: "Tell people about this work", leftSubtext: "This is the first thing backers will read. Be honest, be specific, and make it yours." },
  { id: "ai_impact", title: "AI Impact Statement", leftHeading: "Your impact statement", leftSubtext: "One sentence that tells backers exactly what their support will make possible." },
  { id: "need_title", title: "Need Title", leftHeading: "Give your need a title", leftSubtext: "The title is the first thing backers read on the browse feed. Make it specific and action-focused." },
  { id: "review_launch", title: "Review & Launch", leftHeading: "Review your need", leftSubtext: "Take one last look before we send it for review. You can edit anything after it goes live too." },
  { id: "share_need", title: "Share Your Need", leftHeading: "Your need is submitted!", leftSubtext: "While we review it, start sharing. The more people who see it early, the faster it gets backed." },
]

// Trade categories from spec
const TRADE_CATEGORIES = [
  "Baker / Food Vendor",
  "Tailor",
  "Carpenter",
  "Welder",
  "Cobbler",
  "Market Trader",
  "Electrician",
  "Plumber",
  "Hairdresser",
  "Photographer",
  "Other"
]

// Nigerian states
const NIGERIAN_STATES = Object.keys(NIGERIA_LOCATIONS).sort()

export default function NeedCreationFlow() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  const [currentStep, setCurrentStep] = useState(0)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [hasProfile, setHasProfile] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isGeneratingStory, setIsGeneratingStory] = useState(false)
  const [isGeneratingImpact, setIsGeneratingImpact] = useState(false)
  const [regenerateCount, setRegenerateCount] = useState(0)
  
  // Debug: log search params and auth state
  useEffect(() => {
    console.log('NeedCreationFlow mount:', { 
      searchParams: searchParams ? Object.fromEntries(searchParams.entries()) : null,
      isAuthenticated,
      hasProfile,
      isLoading 
    })
  }, [searchParams, isAuthenticated, hasProfile, isLoading])

  // Form state
  const [formData, setFormData] = useState({
    // Screen 1
    state: "",
    lga: "",
    tradeCategory: "",
    customTrade: "",
    
    // Screen 2
    whoFor: "", // "myself" or "someone_else"
    
    // Screen 3
    goalAmount: "",
    
    // Screen 4
    authMethod: "", // "google" or "phone"
    fullName: "",
    phone: "",
    
    // Screen 4a
    otpCode: "",
    
    // Screen 6
    photoFile: null as File | null,
    photoUrl: "",
    
    // Screen 7
    story: "",
    storyMethod: "write", // "write", "record", "ai"
    aiPrompts: {
      experience: "",
      product: "",
      community: "",
      equipment: ""
    },
    
    // Screen 8
    impactStatement: "",
    
    // Screen 9
    needTitle: "",
    
    // Screen 10
    agreedToTerms: false,
  })
  
  // OTP state
  const [otpSent, setOtpSent] = useState(false)
  const [otpTimeLeft, setOtpTimeLeft] = useState(60)
  const [otpError, setOtpError] = useState("")
  
  // Auth error state
  const [authError, setAuthError] = useState("")
  
  // Submission error state
  const [submitError, setSubmitError] = useState("")
  
  // Carousel state for Screen 5
  const [carouselSlide, setCarouselSlide] = useState(0)
  
  // File input ref for photo upload
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Load auth status and subscribe to changes
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      const authenticated = !!session
      setIsAuthenticated(authenticated)
      
      if (authenticated && session?.user) {
        // Check if user has a profile
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('id')
          .eq('user_id', session.user.id)
          .maybeSingle()
        
        if (!error && profile) {
          console.log('User has profile, setting hasProfile to true')
          setHasProfile(true)
        } else {
          console.log('User has no profile or error checking:', error)
          setHasProfile(false)
        }
      } else {
        setHasProfile(false)
      }
      
      setIsLoading(false)
    }
    checkAuth()
    
    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const authenticated = !!session
      setIsAuthenticated(authenticated)
      
      if (authenticated && session?.user) {
        // Check if user has a profile
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('id')
          .eq('user_id', session.user.id)
          .maybeSingle()
        
        if (!error && profile) {
          console.log('Auth state change: user has profile')
          setHasProfile(true)
        } else {
          setHasProfile(false)
        }
      } else {
        setHasProfile(false)
      }
    })
    
    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])
  
  // Parse OAuth errors from hash fragment
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
      
      setAuthError(`Google OAuth failed: ${decodedError || 'Unknown error'}`);
      // Clear hash
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }
  }, [])
  
  // OTP timer
  useEffect(() => {
    let timer: NodeJS.Timeout
    if (otpSent && otpTimeLeft > 0) {
      timer = setTimeout(() => {
        setOtpTimeLeft(prev => prev - 1)
      }, 1000)
    }
    return () => clearTimeout(timer)
  }, [otpSent, otpTimeLeft])
  
  // Auto-advance when authenticated on auth screens
  useEffect(() => {
    console.log('Auto-advance check:', { isAuthenticated, currentStep, stepId: STEPS[currentStep].id })
    const stepId = STEPS[currentStep].id
    if (isAuthenticated && (stepId === "create_account" || stepId === "otp_verification")) {
      // Skip to "how_it_works" screen (step 5)
      console.log('Skipping auth steps, moving to step 5')
      setCurrentStep(5)
    }
  }, [isAuthenticated, currentStep])

  // Redirect to dashboard if user has a profile (already completed onboarding)
  useEffect(() => {
    if (hasProfile && !isLoading) {
      console.log('User has profile, redirecting to dashboard')
      router.push('/dashboard')
    }
  }, [hasProfile, isLoading, router])

  // Redirect to dashboard if coming from Google OAuth with resumedAuth or new_user flag
  useEffect(() => {
    const resumedAuth = searchParams?.get('resumedAuth') === 'true'
    const newUser = searchParams?.get('new_user') === 'true'
    if (!isLoading && isAuthenticated && (resumedAuth || newUser)) {
      console.log('OAuth flag detected, redirecting to dashboard:', { resumedAuth, newUser })
      // Clear the query params to prevent infinite redirect
      const newUrl = new URL(window.location.href)
      newUrl.searchParams.delete('resumedAuth')
      newUrl.searchParams.delete('new_user')
      window.history.replaceState({}, '', newUrl.toString())
      router.push('/dashboard')
    }
  }, [isLoading, isAuthenticated, searchParams, router])

  // Auto-generate impact statement when reaching AI impact screen
  useEffect(() => {
    const stepId = STEPS[currentStep].id
    if (stepId === "ai_impact" && !formData.impactStatement && formData.story) {
      handleGenerateImpactStatement()
    }
  }, [currentStep, formData.impactStatement, formData.story])

  // Auto-scroll to top when screen changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: 'instant' })
    }
  }, [currentStep])
  
  // Clear errors when step changes
  useEffect(() => {
    setSubmitError("")
    setOtpError("")
    setAuthError("")
  }, [currentStep])
  
  // Map trade category label to enum ID
  const getTradeCategoryId = (label: string): string => {
    const mapping: Record<string, string> = {
      "Baker / Food Vendor": "baker",
      "Tailor": "tailor",
      "Carpenter": "carpenter",
      "Welder": "welder",
      "Cobbler": "cobbler",
      "Market Trader": "market_trader",
      "Electrician": "electrician",
      "Plumber": "plumber",
      "Hairdresser": "hair_stylist",
      "Photographer": "other",
      "Other": "other"
    }
    return mapping[label] || "other"
  }
  
  // Handle continue button
  const handleContinue = async () => {
    if (currentStep === STEPS.length - 2) {
      // Review & Launch step - submit the need
      await handleSubmitNeed()
    } else if (currentStep === STEPS.length - 1) {
      // Done step - sign up process complete, redirect to dashboard as logged in user
      router.push("/dashboard")
    } else {
      // Normal flow - go to next screen
      setCurrentStep(prev => prev + 1)
    }
  }
  
  // Handle back button
  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    } else {
      router.push("/")
    }
  }
  
  // Check if current step is complete
  const isStepComplete = () => {
    const stepId = STEPS[currentStep].id
    
    switch (stepId) {
      case "location_trade":
        return formData.state && formData.lga && formData.tradeCategory && 
               (formData.tradeCategory !== "Other" || formData.customTrade)
      case "who_for":
        return formData.whoFor !== ""
      case "goal_amount":
        return parseInt(formData.goalAmount) > 0
      case "create_account":
        // If already authenticated, skip
        if (isAuthenticated) return true
        
        if (formData.authMethod === "google") {
          return true // Google auth handled separately
        }
        // Phone path: require full name and valid phone
        return formData.fullName.trim().length >= 2 && formData.phone.length >= 10
      case "otp_verification":
        return formData.otpCode.length === 6
      case "cover_photo":
        // Photo is optional (can be skipped)
        return true
      case "the_story":
        return formData.story.split(/\s+/).length >= 30
      case "ai_impact":
        return formData.impactStatement.length > 0
      case "need_title":
        return formData.needTitle.length >= 10
      case "review_launch":
        return formData.agreedToTerms
      default:
        return true
    }
  }
  
  // Handle OTP send
  const handleSendOtp = async () => {
    setIsLoading(true)
    setOtpError("")
    setAuthError("")
    
    try {
      // Format phone number
      let cleanPhone = formData.phone.replace(/[^0-9]/g, "")
      if (cleanPhone.startsWith("0") && cleanPhone.length === 11) {
        cleanPhone = "+234" + cleanPhone.slice(1)
      } else if (!cleanPhone.startsWith("+")) {
        cleanPhone = "+234" + cleanPhone
      }
      
      // Send OTP via Twilio API
      console.log("Sending OTP to phone:", cleanPhone)
      let res
      try {
        res = await fetch("/api/auth/send-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone: cleanPhone })
        })
      } catch (networkError) {
        console.error("Network error sending OTP:", networkError)
        setOtpError("Network error. Please check your connection and try again.")
        return
      }
      
      console.log("OTP API response status:", res.status, "ok:", res.ok)
      let data
      try {
        data = await res.json()
        console.log("OTP API response data:", data)
      } catch (jsonError) {
        console.error("Failed to parse JSON response:", jsonError)
        setOtpError(`Server error (${res.status}). Please try again.`)
        return
      }
      
      if (!res.ok || !data.success) {
        setOtpError(data.error || `Failed to send OTP (${res.status}). Please try again.`)
      } else {
        setOtpSent(true)
        setOtpTimeLeft(60)
        // Automatically advance to OTP verification screen (Screen 4a)
        setCurrentStep(4)
      }
    } catch (error: any) {
      console.error("OTP send error:", error)
      setOtpError("Failed to send OTP. Please check your connection and try again.")
    } finally {
      setIsLoading(false)
    }
  }
  
   // Create or sign in Supabase user with phone number
  const createOrSignInUserWithPhone = async (phone: string): Promise<boolean> => {
    try {
      // Use phone as email (phone@buildbridge.app) for Supabase auth
      const email = `${phone.replace(/[^0-9]/g, '')}@buildbridge.app`
      const password = `buildbridge-${phone.replace(/[^0-9]/g, '')}`
      const userName = formData.fullName.trim()
      
      console.log("Attempting auth with email:", email)
      
      // 1. Ensure user is synced and email_confirmed via server admin key
      const syncResult = await adminSyncPhoneUser(phone, userName)
      if (!syncResult.success) {
        console.error("Failed to sync user via admin API:", syncResult.error)
        alert("Server Error: " + syncResult.error)
        return false
      }
      
      // 2. Sign in with the now-guaranteed-confirmed account
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      console.log("Sign in attempt result:", { signInData, signInError })
      
      if (signInError) {
        console.error("Sign in failed:", signInError)
        alert("Sign In Error: " + signInError.message)
        return false
      }
      
      // Verify session is set
      const { data: { session } } = await supabase.auth.getSession()
      console.log("Session after auth attempt:", session ? "Exists" : "None")
      
      return !!session
    } catch (error: any) {
      console.error('Error in phone user auth:', error)
      alert("Fatal Auth Error: " + error.message)
      return false
    }
  }
  
  // Handle OTP verify
  const handleVerifyOtp = async (overrideCode?: string) => {
    setIsLoading(true)
    setOtpError("")
    setAuthError("")
    
    try {
      // Format phone number
      let cleanPhone = formData.phone.replace(/[^0-9]/g, "")
      if (cleanPhone.startsWith("0") && cleanPhone.length === 11) {
        cleanPhone = "+234" + cleanPhone.slice(1)
      } else if (!cleanPhone.startsWith("+")) {
        cleanPhone = "+234" + cleanPhone
      }
      
      const otpToVerify = typeof overrideCode === 'string' ? overrideCode : formData.otpCode;
      
      // Verify OTP via Twilio API
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: cleanPhone, code: otpToVerify })
      })
      
      const data = await res.json()
      
      if (!res.ok || !data.success) {
        setOtpError(data.error || "The code entered is incorrect or has expired.")
      } else {
        // OTP verified successfully - create or sign in Supabase user
        const authSuccess = await createOrSignInUserWithPhone(cleanPhone)
        if (authSuccess) {
          // Mark as authenticated
          setIsAuthenticated(true)
          // Auto-advance will be handled by useEffect
        } else {
          setOtpError("Failed to create account. Please try again.")
        }
      }
    } catch (error: any) {
      console.error("OTP verification error:", error)
      setOtpError("Failed to verify OTP. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }
  
  // Handle AI story generation
  const handleGenerateStory = async () => {
    setIsGeneratingStory(true)
    try {
      const res = await fetch("/api/generate-story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          experience: formData.aiPrompts.experience,
          product: formData.aiPrompts.product,
          community: formData.aiPrompts.community,
          equipment: formData.aiPrompts.equipment,
          isSelf: formData.whoFor === "myself"
        })
      })
      
      const data = await res.json()
      
      if (data.success) {
        // Update story and switch to write tab
        setFormData(prev => ({ ...prev, story: data.story, storyMethod: "write" }))
      } else {
        // Show error (could add error state)
        console.error("Failed to generate story:", data.error)
      }
    } catch (error) {
      console.error("Failed to generate story:", error)
    } finally {
      setIsGeneratingStory(false)
    }
  }
  
  // Handle AI impact statement generation
  const handleGenerateImpactStatement = async () => {
    setIsGeneratingImpact(true)
    try {
      const trade = formData.tradeCategory === "Other" ? formData.customTrade : formData.tradeCategory
      const item = formData.aiPrompts.equipment || "equipment"
      const story = formData.story
      
      if (!trade || !item || !story) {
        console.warn("Missing data for impact statement generation")
        return
      }
      
      const res = await fetch("/api/impact-statement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trade, item_name: item, story })
      })
      
      const data = await res.json()
      
      if (data.statement) {
        setFormData(prev => ({ ...prev, impactStatement: data.statement }))
      } else {
        console.error("Failed to generate impact statement:", data.error)
      }
    } catch (error) {
      console.error("Failed to generate impact statement:", error)
    } finally {
      setIsGeneratingImpact(false)
    }
  }
  
  // Handle Google OAuth
  const handleGoogleAuth = async () => {
    setIsLoading(true)
    setAuthError('')
    try {
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
      const redirectTo = `${baseUrl}/auth/callback?next=/create-need&flow=signup`
      console.log('Google OAuth redirectTo:', redirectTo)
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo
        }
      })
    } catch (error) {
      console.error('Google OAuth error:', error)
      setAuthError('Failed to sign in with Google. Please check your configuration and try again.')
      setIsLoading(false)
    }
  }
  

  // Handle photo upload
  const handlePhotoUpload = async (file: File) => {
    setIsLoading(true)
    try {
      // Generate unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `needs/${fileName}`
      
      // Upload to Supabase storage
      const { data, error } = await supabase.storage
        .from('needs')
        .upload(filePath, file)
      
      if (error) {
        console.error("Photo upload error:", error.message)
        // TODO: show error to user
        return
      }
      
      // Get public URL
      const { data: urlData } = supabase.storage
        .from('needs')
        .getPublicUrl(filePath)
      
      // Update form data
      setFormData(prev => ({
        ...prev,
        photoFile: file,
        photoUrl: urlData.publicUrl
      }))
    } catch (error: any) {
      console.error("Photo upload failed:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Trigger file input for photo upload
  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handlePhotoUpload(file)
    }
  }

  // Handle need submission
  const handleSubmitNeed = async () => {
    console.log("handleSubmitNeed called - step:", currentStep, "isAuthenticated:", isAuthenticated)
    setIsLoading(true)
    setSubmitError("")
    
    try {
      // Validate required form data before proceeding
      if (!formData.state) {
        throw new Error("State is required. Please go back to the Location & Trade step.")
      }
      if (!formData.lga) {
        throw new Error("Local Government Area is required. Please go back to the Location & Trade step.")
      }
      if (!formData.tradeCategory) {
        throw new Error("Trade category is required. Please go back to the Location & Trade step.")
      }
      if (!formData.goalAmount || parseFloat(formData.goalAmount) <= 0) {
        throw new Error("Valid goal amount is required. Please go back to the Goal Amount step.")
      }
      if (!formData.story || formData.story.trim().length < 30) {
        throw new Error("Story is required and must be at least 30 words. Please go back to the Story step.")
      }
      if (!formData.impactStatement) {
        throw new Error("Impact statement is required. Please go back to the AI Impact Statement step.")
      }
      if (!formData.needTitle || formData.needTitle.length < 10) {
        throw new Error("Need title is required and must be at least 10 characters. Please go back to the Need Title step.")
      }
      // 1. Get current user
      console.log("Getting current user...")
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      console.log("User fetch result:", { user: user?.id, error: userError })
      if (userError || !user) {
        console.error("User not authenticated:", userError)
        throw new Error("You must be logged in to create a need")
      }
      
      // 2. Get or create profile for user
      console.log("Getting/creating profile for user:", user.id)
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle()
      
      console.log("Profile fetch result:", { profile, error: profileError })
      let profileId
      if (profileError || !profile) {
        // Create profile
        console.log("Creating new profile...")
        const tradeCategoryId = getTradeCategoryId(formData.tradeCategory)
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
           .insert({
             user_id: user.id,
             full_name: formData.fullName || '',
             trade_category: tradeCategoryId as any,
             trade_other_description: formData.tradeCategory === "Other" ? formData.customTrade : null,
             location_state: formData.state.toLowerCase().replace(/\s+/g, '_') as any,
             location_lga: formData.lga,
           })
          .select('id')
          .single()
        
        console.log("Profile creation result:", { newProfile, error: createError })
        if (createError) {
          console.error("Failed to create profile:", createError)
          // Try to continue with default profile (maybe exists via trigger)
          // Fetch again
          const { data: existingProfile } = await supabase
            .from('profiles')
            .select('id')
            .eq('user_id', user.id)
            .maybeSingle()
          if (!existingProfile) {
            throw new Error("Could not create profile")
          }
          profileId = existingProfile.id
        } else {
          profileId = newProfile.id
        }
      } else {
        profileId = profile.id
      }
      
       console.log("Profile ID:", profileId)
       if (!profileId) {
         throw new Error("Profile ID is missing")
       }
      
       // 3. Use uploaded photo URL or default placeholder
      const photoUrl = formData.photoUrl || "/images/placeholder-need.jpg"
      console.log("Photo URL:", photoUrl)
      
      // 4. Create need record
      console.log("Creating need record...")
      const needData = {
        profile_id: profileId,
        item_name: formData.needTitle || formData.aiPrompts.equipment || "Equipment",
        item_cost: parseFloat(formData.goalAmount), // DECIMAL(12,2) in Naira
        photo_url: photoUrl,
        story: formData.story.slice(0, 150), // Max 150 chars
        impact_statement: formData.impactStatement.slice(0, 200), // Max 200 chars
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
        status: 'pending_review',
        published_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
       console.log("Need data:", needData, "profileId:", profileId, "userId:", user?.id)
      
      const { error: needError } = await supabase
        .from('needs')
        .insert(needData)
      
      if (needError) {
        console.error("Need creation error:", needError)
        throw needError
      }
      
      console.log("Need created successfully, advancing to share screen")
      // 5. Redirect to success screen
      setCurrentStep(STEPS.length - 1) // Share screen
    } catch (error) {
       console.error("Failed to submit need:", error)
       console.error("Error details:", typeof error, error?.constructor?.name, error?.name, error?.code, error?.details, error?.message)
       const errorMessage = error instanceof Error ? error.message : "Failed to submit need. Please try again."
      if (errorMessage.includes("Auth session") || errorMessage.includes("not authenticated") || errorMessage.includes("must be logged in")) {
        setSubmitError("Your session has expired. Please go back to the 'Create Your Account' step and sign in again.")
      } else {
        setSubmitError(errorMessage)
      }
    } finally {
      setIsLoading(false)
    }
  }
  
  // Get LGAs for selected state
  const getLGAs = () => {
    if (!formData.state) return []
    return NIGERIA_LOCATIONS[formData.state] || []
  }
  
  // Render current step content
  const renderStepContent = () => {
    const stepId = STEPS[currentStep].id
    
    switch (stepId) {
      case "location_trade":
        return renderLocationTrade()
      case "who_for":
        return renderWhoFor()
      case "goal_amount":
        return renderGoalAmount()
      case "create_account":
        return renderCreateAccount()
      case "otp_verification":
        return renderOtpVerification()
      case "how_it_works":
        return renderHowItWorks()
      case "cover_photo":
        return renderCoverPhoto()
      case "the_story":
        return renderTheStory()
      case "ai_impact":
        return renderAiImpact()
      case "need_title":
        return renderNeedTitle()
      case "review_launch":
        return renderReviewLaunch()
      case "share_need":
        return renderShareNeed()
      default:
        return null
    }
  }
  
  // Screen 1: Location & Trade Category
  const renderLocationTrade = () => (
    <div className="space-y-8">
      <div className="space-y-4">
        <h2 className="text-headline-medium font-black text-on-surface">
          Where will the funds go?
        </h2>
        <p className="text-body-large text-on-surface-variant">
          Choose the location where your tradesperson works and where funds will be withdrawn.
        </p>
      </div>
      
      <div className="space-y-6">
        <div className="space-y-2">
          <label className="text-label-large font-bold text-on-surface">State</label>
          <select
            value={formData.state}
            onChange={(e) => {
              setFormData(prev => ({ ...prev, state: e.target.value, lga: "" }))
            }}
            className="w-full p-4 rounded-2xl border border-outline-variant bg-surface text-on-surface"
          >
            <option value="">Select state</option>
            {NIGERIAN_STATES.map(state => (
              <option key={state} value={state}>{state}</option>
            ))}
          </select>
        </div>
        
        <div className="space-y-2">
          <label className="text-label-large font-bold text-on-surface">Local Government Area</label>
          <select
            value={formData.lga}
            onChange={(e) => setFormData(prev => ({ ...prev, lga: e.target.value }))}
            disabled={!formData.state}
            className="w-full p-4 rounded-2xl border border-outline-variant bg-surface text-on-surface disabled:opacity-50"
          >
            <option value="">
              {formData.state ? "Select LGA" : "Select your state first"}
            </option>
            {getLGAs().map(lga => (
              <option key={lga} value={lga}>{lga}</option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="space-y-4 pt-8 border-t border-outline-variant/30">
        <h2 className="text-headline-medium font-black text-on-surface">
          What best describes the trade?
        </h2>
        <p className="text-body-large text-on-surface-variant">
          Choose the category that fits best. This helps backers find the right needs.
        </p>
        
        <div className="flex flex-wrap gap-3 mt-4">
          {TRADE_CATEGORIES.map(category => (
            <button
              key={category}
              type="button"
              onClick={() => {
                setFormData(prev => ({ 
                  ...prev, 
                  tradeCategory: category,
                  customTrade: category === "Other" ? prev.customTrade : ""
                }))
              }}
              className={cn(
                "px-6 py-3 rounded-full border-2 text-label-large font-medium transition-all",
                formData.tradeCategory === category
                  ? "bg-primary border-primary text-white"
                  : "bg-transparent border-primary text-primary hover:bg-primary/10"
              )}
            >
              {category}
            </button>
          ))}
        </div>
        
        {formData.tradeCategory === "Other" && (
          <div className="mt-6 space-y-2">
            <label className="text-label-large font-bold text-on-surface">Describe the trade</label>
            <Input
              value={formData.customTrade}
              onChange={(e) => setFormData(prev => ({ ...prev, customTrade: e.target.value }))}
              placeholder="e.g. Vulcaniser, Sign painter, Soap maker"
              className="w-full"
            />
          </div>
        )}
      </div>
    </div>
  )
  
  // Screen 2: Who Are You Raising For?
  const renderWhoFor = () => (
    <div className="space-y-8">
      <div className="space-y-4">
        <h2 className="text-label-large font-bold text-on-surface">Choose one</h2>
        
        <div className="flex flex-col sm:flex-row gap-4">
          {["Myself", "Someone else"].map(option => (
            <button
              key={option}
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, whoFor: option.toLowerCase() }))}
              className={cn(
                "px-8 py-6 rounded-2xl border-2 text-headline-small font-black text-center transition-all",
                formData.whoFor === option.toLowerCase()
                  ? "bg-primary border-primary text-white"
                  : "bg-transparent border-outline-variant text-on-surface hover:border-primary"
              )}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
      
      {formData.whoFor && (
        <div className="p-6 bg-surface-variant/30 rounded-2xl">
          <p className="text-body-large text-on-surface">
            {formData.whoFor === "myself"
              ? "You are the tradesperson. Funds will be transferred directly to your bank account when your need is funded."
              : "You are raising on behalf of a tradesperson you know. They will receive the funds directly. Their name will appear as the beneficiary on the public need page."
            }
          </p>
        </div>
      )}
      
      <div className="p-6 bg-surface-variant/10 rounded-2xl border border-outline-variant/30">
        <p className="text-label-small text-on-surface-variant">
          *BuildBridge does not support fundraising for organisations or charities. Every need is tied to a specific individual tradesperson and a specific item or service.*
        </p>
      </div>
    </div>
  )
  
  // Screen 3: Goal Amount
  const renderGoalAmount = () => (
    <div className="space-y-8">
      <div className="space-y-4">
        <h2 className="text-headline-medium font-black text-on-surface">
          How much do you need to raise?
        </h2>
        
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-headline-medium font-black text-on-surface">
            ₦
          </div>
          <Input
            value={formData.goalAmount}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, "")
              setFormData(prev => ({ ...prev, goalAmount: value }))
            }}
            placeholder="e.g. 35,000"
            className="pl-12 text-headline-medium font-black"
            type="tel"
          />
        </div>
        
        {formData.goalAmount && (
          <div className="p-4 rounded-2xl bg-surface-variant/30 mt-4">
            <p className="text-body-medium text-on-surface font-medium">
              {getBadgeGuidance(parseInt(formData.goalAmount) || 0)}
            </p>
          </div>
        )}
      </div>
      
      <div className="p-6 bg-primary/5 border border-primary/20 rounded-2xl">
        <p className="text-body-large text-on-surface">
          💡 Unlike other platforms, BuildBridge does not deduct a platform fee from what the tradesperson receives. What backers pledge is exactly what they get — no need to inflate your goal. You keep every Naira pledged, even if you don't reach your full target.
        </p>
      </div>
    </div>
  )
  
  // Helper for badge guidance
  const getBadgeGuidance = (amount: number) => {
    if (amount === 0) return ""
    if (amount <= 20000) return "✅ Your current account level can list this need right away."
    if (amount <= 50000) return "ℹ️ You will need 3 community vouches (Level 1) to list this amount."
    if (amount <= 150000) return "ℹ️ You will need Level 2 verification — 5 vouches and a geotagged workspace photo."
    if (amount <= 500000) return "ℹ️ You will need a community leader endorsement (Level 3) for this amount."
    return "ℹ️ Needs above ₦500,000 require full Platform Verification by the BuildBridge team."
  }
  
  // Helper for phone display formatting
  const formatPhoneDisplay = (phone: string) => {
    const cleaned = phone.replace(/[^0-9]/g, "")
    if (cleaned.length === 11 && cleaned.startsWith("0")) {
      return `+234 ${cleaned.slice(1, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`
    }
    if (cleaned.length === 10) {
      return `+234 ${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`
    }
    return phone
  }
  
  // Screen 4: Create Your Account
  const renderCreateAccount = () => {
    if (isAuthenticated) {
      return (
        <div className="space-y-8">
          <div className="p-6 bg-green-500/10 border border-green-500/20 rounded-2xl">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-6 w-6 text-green-500" />
              <p className="text-body-large font-medium text-on-surface">
                You're already signed in. You can continue creating your need.
              </p>
            </div>
          </div>
        </div>
      )
    }
    
    return (
      <div className="space-y-8">
        {/* Option A: Google */}
        <div className="space-y-4">
          <button
            type="button"
            onClick={() => {
              setFormData(prev => ({ ...prev, authMethod: "google" }))
              handleGoogleAuth()
            }}
            disabled={isLoading}
            className="w-full p-4 rounded-full border-2 border-outline-variant hover:border-primary transition-colors flex items-center justify-center gap-3 disabled:opacity-50"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span className="text-label-large font-bold text-on-surface">
              Continue with Google
            </span>
          </button>
        </div>
        
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-outline-variant"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-label-medium text-on-surface-variant">
              or
            </span>
          </div>
        </div>
        
        {/* Option B: Full Name + Phone */}
        <div className="space-y-4">
          <div className="space-y-3">
            <label className="text-label-large font-bold text-on-surface">Full Name</label>
            <Input
              value={formData.fullName}
              onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
              placeholder="e.g. John Doe"
              className="w-full"
              type="text"
              autoComplete="name"
            />
          </div>
          
          <div className="space-y-3">
            <label className="text-label-large font-bold text-on-surface">Phone number</label>
            <div className="flex gap-3">
              <div className="px-4 py-3 rounded-2xl border border-outline-variant bg-surface-variant/30 text-label-large font-bold text-on-surface flex items-center">
                +234
              </div>
              <Input
                value={formData.phone}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "")
                  setFormData(prev => ({ 
                    ...prev, 
                    phone: value,
                    authMethod: value.length >= 10 ? "phone" : prev.authMethod
                  }))
                }}
                placeholder="e.g. 0801 234 5678"
                className="flex-1"
                type="tel"
                inputMode="numeric"
              />
            </div>
          </div>
          
          <button
            type="button"
            onClick={() => {
              setFormData(prev => ({ ...prev, authMethod: "phone" }))
              handleSendOtp()
            }}
            disabled={formData.fullName.trim().length < 2 || formData.phone.length < 10 || isLoading}
            className={cn(
              "w-full p-4 rounded-full font-bold transition-all",
              formData.fullName.trim().length >= 2 && formData.phone.length >= 10
                ? "bg-primary text-white hover:bg-primary/90 shadow-lg"
                : "bg-surface-variant/30 text-on-surface-variant cursor-not-allowed"
            )}
          >
            {isLoading ? "Sending..." : "Continue with phone →"}
          </button>
          
          {otpError && (
            <div className="p-4 bg-error/10 border border-error/20 rounded-2xl">
              <p className="text-body-medium text-error">{otpError}</p>
            </div>
          )}
          
          {authError && (
            <div className="p-4 bg-error/10 border border-error/20 rounded-2xl">
              <p className="text-body-medium text-error">{authError}</p>
            </div>
          )}
        </div>
        
        <div className="p-4 bg-surface-variant/30 rounded-2xl">
          <p className="text-label-small text-on-surface-variant">
            🔒 Your information is only used to verify your account and keep it secure.
          </p>
        </div>
        
        <div className="text-center">
          <p className="text-body-medium text-on-surface-variant">
            Already have an account?{" "}
            <Link href="/login" className="text-primary font-bold hover:underline">
              Sign in →
            </Link>
          </p>
        </div>
      </div>
    )
  }
  
   // Screen 4a: OTP Verification
  const renderOtpVerification = () => (
    <div className="space-y-8">
      <div className="space-y-4">
        <h2 className="text-headline-medium font-black text-on-surface">
          Enter the 6-digit code sent to {formatPhoneDisplay(formData.phone)}
        </h2>
        
        <div className="flex justify-center gap-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Input
              key={index}
              id={`otp-input-${index}`}
              value={formData.otpCode[index] || ""}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "")
                if (value.length <= 1) {
                  const newOtp = formData.otpCode.split("")
                  newOtp[index] = value
                  const joined = newOtp.join("")
                  setFormData(prev => ({ ...prev, otpCode: joined }))
                  
                  // Auto-advance
                  if (value && index < 5) {
                    const nextInput = document.getElementById(`otp-input-${index + 1}`)
                    if (nextInput) nextInput.focus()
                  }
                  
                  // Auto-submit on 6th digit
                  if (joined.length === 6) {
                    handleVerifyOtp(joined)
                  }
                }
              }}
              onKeyDown={(e) => {
                // Focus previous input on backspace if current is empty
                if (e.key === "Backspace" && !formData.otpCode[index] && index > 0) {
                  const prevInput = document.getElementById(`otp-input-${index - 1}`)
                  if (prevInput) prevInput.focus()
                }
              }}
              className="w-16 h-16 text-center text-headline-medium font-black rounded-2xl"
              maxLength={1}
              type="tel"
            />
          ))}
        </div>
        
        {otpError && (
          <div className="p-4 bg-error/10 border border-error/20 rounded-2xl">
            <p className="text-body-medium text-error">{otpError}</p>
          </div>
        )}
        
        <div className="text-center space-y-4">
          <button
            type="button"
            onClick={handleSendOtp}
            disabled={otpTimeLeft > 0}
            className="text-label-large text-primary font-bold disabled:text-on-surface-variant disabled:cursor-not-allowed"
          >
            {otpTimeLeft > 0 ? `Resend in 00:${otpTimeLeft.toString().padStart(2, '0')}` : "Resend code"}
          </button>
          
          <div>
            <button
              type="button"
              onClick={() => setCurrentStep(STEPS.findIndex(s => s.id === "create_account"))}
              className="text-label-large text-on-surface-variant hover:text-primary"
            >
              Change number
            </button>
          </div>
        </div>
      </div>
    </div>
  )
  
  // Screen 5: How BuildBridge Works
  const renderHowItWorks = () => (
    <div className="space-y-8">
      <div className="space-y-6">
        <div className="p-8 rounded-3xl bg-surface-variant/30 border-2 border-transparent">
          <h3 className="text-headline-medium font-black text-on-surface mb-4">Create the need</h3>
          <p className="text-body-large text-on-surface-variant">
            Tell us what is needed and why. Add a photo and a short story. The whole thing takes less than 5 minutes.
          </p>
        </div>
        
        <div className="p-8 rounded-3xl bg-surface-variant/30 border-2 border-transparent">
          <h3 className="text-headline-medium font-black text-on-surface mb-4">Your community steps in</h3>
          <p className="text-body-large text-on-surface-variant">
            Neighbours, market friends, and family abroad — anyone can back a need directly from their phone. No account needed to give.
          </p>
        </div>
        
        <div className="p-8 rounded-3xl bg-surface-variant/30 border-2 border-transparent">
          <h3 className="text-headline-medium font-black text-on-surface mb-4">The money goes straight to you</h3>
          <p className="text-body-large text-on-surface-variant">
            Every Naira pledged goes directly to the tradesperson. No platform fees deducted. You keep everything — even if you don't reach your full target.
          </p>
          
          <div className="mt-6 p-4 bg-surface-variant/50 rounded-2xl">
            <p className="text-body-medium text-on-surface">
              📸 *"See how Ada funded her oven repair in 3 days →"*
            </p>
          </div>
        </div>
      </div>
    </div>
  )
  
  // Screen 6: Cover Photo
  const renderCoverPhoto = () => (
    <div className="space-y-8">
      <div className="space-y-6">
         <input
           type="file"
           ref={fileInputRef}
           onChange={handleFileChange}
           accept="image/jpeg,image/png,image/webp"
           className="hidden"
         />
         <div 
           className="border-2 border-dashed border-outline-variant rounded-3xl p-12 text-center cursor-pointer hover:border-primary transition-colors"
           onClick={triggerFileInput}
         >
           {formData.photoUrl ? (
             <div className="space-y-4">
               <img 
                 src={formData.photoUrl} 
                 alt="Uploaded cover" 
                 className="w-32 h-32 mx-auto rounded-2xl object-cover"
               />
               <p className="text-headline-small font-black text-on-surface">Photo uploaded ✓</p>
               <p className="text-body-medium text-on-surface-variant">Tap to change photo</p>
             </div>
           ) : (
             <>
               <Camera className="h-16 w-16 mx-auto mb-4 text-outline-variant" />
               <p className="text-headline-small font-black text-on-surface mb-2">Tap to upload a photo</p>
               <p className="text-body-medium text-on-surface-variant">
                 Minimum 400 × 400px. JPG, PNG, or WEBP only.
               </p>
             </>
           )}
         </div>
        
         <div className="flex gap-4">
           <button 
             type="button"
             onClick={triggerFileInput}
             className="flex-1 py-4 rounded-2xl border-2 border-primary text-primary font-bold hover:bg-primary/10"
           >
             Take a photo
           </button>
           <button 
             type="button"
             onClick={triggerFileInput}
             className="flex-1 py-4 rounded-2xl border-2 border-primary text-primary font-bold hover:bg-primary/10"
           >
             Choose from gallery
           </button>
         </div>
      </div>
      
      <div className="space-y-4">
        <h3 className="text-headline-small font-black text-on-surface">Photo guidance</h3>
        <ul className="space-y-2">
          <li className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span className="text-body-medium text-on-surface">Face clearly visible, looking at the camera</span>
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span className="text-body-medium text-on-surface">Good natural or bright lighting</span>
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span className="text-body-medium text-on-surface">Shows the trade — at the machine, at the workbench, at the stall</span>
          </li>
          <li className="flex items-center gap-2">
            <X className="h-5 w-5 text-error" />
            <span className="text-body-medium text-on-surface">Avoid blurry, dark, or group photos</span>
          </li>
          <li className="flex items-center gap-2">
            <X className="h-5 w-5 text-error" />
            <span className="text-body-medium text-on-surface">Avoid logos, screenshots, or stock images</span>
          </li>
        </ul>
      </div>
      
      <div className="p-4 bg-surface-variant/30 rounded-2xl">
        <p className="text-body-medium text-on-surface">
          📍 *This photo will be geotagged to confirm the listing location. Make sure location access is enabled on your device.*
        </p>
      </div>
      
      <div className="text-center">
        <button
          type="button"
          onClick={handleContinue}
          className="text-label-large text-primary font-bold hover:underline"
        >
          I'll add a photo later →
        </button>
      </div>
    </div>
  )
  
  // Screen 7: The Story (simplified)
  const renderTheStory = () => (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="flex border-b border-outline-variant">
          <button
            type="button"
            onClick={() => setFormData(prev => ({ ...prev, storyMethod: "write" }))}
            className={cn(
              "flex-1 py-4 text-label-large font-bold border-b-2",
              formData.storyMethod === "write"
                ? "border-primary text-primary"
                : "border-transparent text-on-surface-variant"
            )}
          >
            Write
          </button>
          <button
            type="button"
            onClick={() => setFormData(prev => ({ ...prev, storyMethod: "ai" }))}
            className={cn(
              "flex-1 py-4 text-label-large font-bold border-b-2",
              formData.storyMethod === "ai"
                ? "border-primary text-primary"
                : "border-transparent text-on-surface-variant"
            )}
          >
            Generate with AI
          </button>
        </div>
      </div>
      
      {formData.storyMethod === "write" ? (
        <div className="space-y-4">
          <textarea
            value={formData.story}
            onChange={(e) => setFormData(prev => ({ ...prev, story: e.target.value }))}
            placeholder="I have been doing this trade for...&#10;My work means a lot to my community because...&#10;The item I need is...&#10;Without it, I cannot..."
            className="w-full h-64 p-4 rounded-2xl border border-outline-variant bg-surface text-on-surface resize-none"
          />
          <div className="text-right">
            <p className="text-label-medium text-on-surface-variant">
              {formData.story.split(/\s+/).filter(w => w).length} / 300 words
            </p>
          </div>
          
          <div className="flex items-center gap-3 p-4 bg-surface-variant/30 rounded-2xl">
            <Mic className="h-6 w-6 text-primary" />
            <p className="text-body-medium text-on-surface">
              Click the mic icon to speak naturally — tell us about the trade and what it means to the community.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <p className="text-body-large text-on-surface-variant">
            Answer three quick questions and we'll write the story for you.
          </p>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-label-large font-bold text-on-surface">
                1. How long have they been doing this trade?
              </label>
              <Input
                value={formData.aiPrompts.experience}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  aiPrompts: { ...prev.aiPrompts, experience: e.target.value }
                }))}
                placeholder="e.g. 8 years"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-label-large font-bold text-on-surface">
                2. What do they make or do?
              </label>
              <Input
                value={formData.aiPrompts.product}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  aiPrompts: { ...prev.aiPrompts, product: e.target.value }
                }))}
                placeholder="e.g. Custom men's suits and school uniforms"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-label-large font-bold text-on-surface">
                3. Who do they serve in their community?
              </label>
              <Input
                value={formData.aiPrompts.community}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  aiPrompts: { ...prev.aiPrompts, community: e.target.value }
                }))}
                placeholder="e.g. Families in Surulere who can't afford island tailors"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-label-large font-bold text-on-surface">
                4. What is the specific item you need to repair or replace?
              </label>
              <Input
                value={formData.aiPrompts.equipment}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  aiPrompts: { ...prev.aiPrompts, equipment: e.target.value }
                }))}
                placeholder="e.g. Sewing machine"
              />
            </div>
          </div>
          
          <button 
            onClick={handleGenerateStory}
            disabled={isGeneratingStory || !formData.aiPrompts.experience || !formData.aiPrompts.product || !formData.aiPrompts.community || !formData.aiPrompts.equipment}
            className="w-full py-4 rounded-2xl bg-primary text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGeneratingStory ? "Generating..." : "Generate my story →"}
          </button>
        </div>
      )}
    </div>
  )
  
  // Screen 8: AI Impact Statement
  const renderAiImpact = () => (
    <div className="space-y-8">
      <div className="space-y-4">
        <p className="text-body-large text-on-surface-variant">
          BuildBridge generates a short impact statement from your story. It appears on your need card and in every share image.
        </p>
        
        {isGeneratingImpact ? (
          <div className="p-8 bg-surface-variant/30 rounded-3xl text-center">
            <Loader2 className="h-12 w-12 mx-auto mb-4 text-primary animate-spin" />
            <p className="text-headline-small font-black text-on-surface">Writing your impact statement...</p>
          </div>
        ) : formData.impactStatement ? (
          <div className="p-8 bg-surface-variant/30 rounded-3xl">
            <p className="text-headline-small font-black text-on-surface text-center mb-4">Your impact statement</p>
            <p className="text-body-large text-on-surface text-center">{formData.impactStatement}</p>
          </div>
        ) : (
          <div className="p-8 bg-surface-variant/30 rounded-3xl text-center">
            <p className="text-body-large text-on-surface">No impact statement generated yet.</p>
          </div>
        )}
        
        <div className="flex gap-4 justify-center">
          <button 
            onClick={handleContinue}
            disabled={!formData.impactStatement}
            className="px-6 py-3 rounded-full bg-primary text-white font-bold disabled:opacity-50"
          >
            Use this statement
          </button>
          <button 
            onClick={() => {
              setRegenerateCount(prev => prev + 1)
              handleGenerateImpactStatement()
            }}
            disabled={isGeneratingImpact || regenerateCount >= 2}
            className="px-6 py-3 rounded-full border-2 border-primary text-primary font-bold disabled:opacity-50"
          >
            {regenerateCount >= 2 ? "No regenerations left" : `Regenerate (${2 - regenerateCount} remaining)`}
          </button>
          <button 
            onClick={() => {
              // TODO: Implement edit manually
              const newStatement = prompt("Edit impact statement:", formData.impactStatement)
              if (newStatement !== null) {
                setFormData(prev => ({ ...prev, impactStatement: newStatement }))
              }
            }}
            className="px-6 py-3 rounded-full border-2 border-outline-variant text-on-surface-variant font-bold"
          >
            Edit manually
          </button>
        </div>
      </div>
    </div>
  )
  
  // Screen 9: Need Title
  const renderNeedTitle = () => (
    <div className="space-y-8">
      <div className="space-y-4">
        <label className="text-label-large font-bold text-on-surface">
          Title (up to 60 characters)
        </label>
        <Input
          value={formData.needTitle}
          onChange={(e) => setFormData(prev => ({ ...prev, needTitle: e.target.value }))}
          placeholder="e.g. Help Ada repair her oven and get back to baking"
          className="w-full"
        />
        <div className="text-right">
          <p className={cn(
            "text-label-medium",
            formData.needTitle.length > 57 ? "text-error" :
            formData.needTitle.length > 50 ? "text-warning" :
            "text-on-surface-variant"
          )}>
            {formData.needTitle.length} / 60
          </p>
        </div>
      </div>
      
      <div className="p-6 bg-primary/5 border border-primary/20 rounded-2xl">
        <p className="text-body-large text-on-surface mb-2">
          💡 Suggested: "Back [Name]'s [item] — [trade] in [location]"
        </p>
        <p className="text-body-medium text-on-surface-variant mb-4">
          Example: "Back Emeka's drill — Carpenter in Yaba, Lagos"
        </p>
        <button className="text-primary font-bold hover:underline">
          Use this suggestion →
        </button>
      </div>
      
      <div className="space-y-4">
        <h3 className="text-headline-small font-black text-on-surface">Title guidance</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-green-500/10 rounded-2xl">
            <p className="text-body-medium font-bold text-green-700 mb-2">✅ Do</p>
            <ul className="space-y-1 text-sm text-on-surface">
              <li>Include the person's name</li>
              <li>Name the specific item</li>
              <li>State the outcome or trade</li>
            </ul>
          </div>
          <div className="p-4 bg-error/10 rounded-2xl">
            <p className="text-body-medium font-bold text-error mb-2">❌ Avoid</p>
            <ul className="space-y-1 text-sm text-on-surface">
              <li>Generic phrases like "Please help me"</li>
              <li>Vague descriptions like "for my business"</li>
              <li>Emotional pressure language</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
  
  // Screen 10: Review & Launch
  const renderReviewLaunch = () => (
    <div className="space-y-8">
      <div className="space-y-6">
        <div className="flex justify-between items-start p-6 bg-surface-variant/30 rounded-2xl">
          <div>
            <p className="text-label-small font-bold text-on-surface-variant mb-1">Title</p>
            <p className="text-body-large font-bold text-on-surface">{formData.needTitle}</p>
          </div>
          <button className="text-primary font-bold hover:underline">Edit →</button>
        </div>
        
        <div className="flex justify-between items-start p-6 bg-surface-variant/30 rounded-2xl">
          <div>
            <p className="text-label-small font-bold text-on-surface-variant mb-1">Goal amount</p>
            <p className="text-body-large font-bold text-on-surface">₦{parseInt(formData.goalAmount).toLocaleString()}</p>
          </div>
          <button className="text-primary font-bold hover:underline">Edit →</button>
        </div>
        
        <div className="flex justify-between items-start p-6 bg-surface-variant/30 rounded-2xl">
          <div>
            <p className="text-label-small font-bold text-on-surface-variant mb-1">Location</p>
            <p className="text-body-large font-bold text-on-surface">{formData.lga}, {formData.state}</p>
          </div>
          <button className="text-primary font-bold hover:underline">Edit →</button>
        </div>
        
        <div className="flex justify-between items-start p-6 bg-surface-variant/30 rounded-2xl">
          <div>
            <p className="text-label-small font-bold text-on-surface-variant mb-1">Trade category</p>
            <p className="text-body-large font-bold text-on-surface">
              {formData.tradeCategory === "Other" ? formData.customTrade : formData.tradeCategory}
            </p>
          </div>
          <button className="text-primary font-bold hover:underline">Edit →</button>
        </div>
        
        <div className="flex justify-between items-start p-6 bg-surface-variant/30 rounded-2xl">
          <div>
            <p className="text-label-small font-bold text-on-surface-variant mb-1">Impact statement</p>
            <p className="text-body-large font-bold text-on-surface">{formData.impactStatement}</p>
          </div>
          <button className="text-primary font-bold hover:underline">Edit →</button>
        </div>
      </div>
      
      <div className="p-6 bg-surface-variant/30 rounded-2xl">
        <p className="text-body-medium text-on-surface mb-4">
          Once submitted, BuildBridge will review your need within 24 hours. You will be notified by WhatsApp or SMS when it is approved and visible to backers.
        </p>
        <p className="text-body-medium text-on-surface">
          You can update your story and goal amount at any time before your need is fully funded.
        </p>
      </div>
      
        <div className="space-y-4">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.agreedToTerms}
            onChange={(e) => setFormData(prev => ({ ...prev, agreedToTerms: e.target.checked }))}
            className="h-6 w-6 rounded border-outline-variant"
          />
          <span className="text-body-medium text-on-surface">
            I agree to the BuildBridge Terms of Service and confirm that all information provided is accurate.
          </span>
        </label>
        {!formData.agreedToTerms && (
          <p className="text-label-medium text-error pl-9">
            You must agree to the Terms of Service to submit your need.
          </p>
        )}
      </div>
      
      {submitError && (
        <div className="p-4 bg-error/10 border border-error/20 rounded-2xl">
          <p className="text-body-medium text-error">{submitError}</p>
        </div>
      )}
    </div>
  )
  
  // Screen 11: Share Your Need
  const renderShareNeed = () => (
    <div className="space-y-8">
      <div className="p-6 bg-surface-variant/30 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-headline-small font-black text-primary">🕐</span>
          </div>
          <div>
            <p className="text-body-large font-bold text-on-surface">
              Under review — we'll notify you by WhatsApp or SMS within 24 hours when your need goes live.
            </p>
          </div>
        </div>
      </div>
      
      <div className="space-y-6">
        <h3 className="text-headline-small font-black text-on-surface">Send a personal message first</h3>
        <p className="text-body-large text-on-surface-variant">
          A direct message to someone who already knows your work converts far better than a public post. Use this ready-made message:
        </p>
        
        <div className="p-6 bg-surface-variant/30 rounded-2xl">
          <p className="text-body-medium text-on-surface mb-4 whitespace-pre-line">
            "Hi [Name], I just listed a need on BuildBridge — a platform that lets people back skilled tradespeople directly. I need ₦{parseInt(formData.goalAmount).toLocaleString()} to repair my sewing machine so I can keep taking orders. Would you be able to back me, or share this with someone who might? Here's the link: [need URL]"
          </p>
          <div className="flex gap-3">
            <button className="px-6 py-3 rounded-full bg-primary text-white font-bold">
              Copy message
            </button>
            <button className="px-6 py-3 rounded-full border-2 border-primary text-primary font-bold">
              Open in WhatsApp
            </button>
          </div>
        </div>
      </div>
      
      <div className="space-y-6">
        <h3 className="text-headline-small font-black text-on-surface">Go wider</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-6 bg-surface-variant/30 rounded-2xl">
            <p className="text-body-large font-bold text-on-surface mb-2">WhatsApp Status</p>
            <p className="text-body-medium text-on-surface-variant mb-4">
              Your 16:9 share card is ready — photo, progress bar, and impact statement included.
            </p>
            <button className="w-full py-3 rounded-full bg-primary text-white font-bold">
              Share to WhatsApp Status →
            </button>
          </div>
          
          <div className="p-6 bg-surface-variant/30 rounded-2xl">
            <p className="text-body-large font-bold text-on-surface mb-2">Instagram Stories</p>
            <p className="text-body-medium text-on-surface-variant mb-4">
              Your 9:16 story card is ready to post.
            </p>
            <button className="w-full py-3 rounded-full bg-primary text-white font-bold">
              Share to Instagram →
            </button>
          </div>
        </div>
      </div>
      
      <div className="p-6 bg-surface-variant/10 rounded-2xl border border-outline-variant/30">
        <p className="text-body-medium text-on-surface">
          🕐 *The first 48 hours matter most. Your need is featured in the BuildBridge browse feed for its first 48 hours after approval. If no pledge is received within 24 hours of going live, we'll automatically send you more ready-made messages to keep the momentum going.*
        </p>
      </div>
    </div>
  )
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 text-primary animate-spin" />
      </div>
    )
  }
  
  const currentStepData = STEPS[currentStep]
  
  return (
    <div className="h-screen bg-white">
      {/* Two-panel Layout */}
      <div className="flex h-screen">
        {/* Left Panel - Fixed */}
        <div className="hidden lg:flex w-2/5 flex-shrink-0 sticky top-0 h-screen bg-surface-variant/10 p-12 flex-col justify-between">
           <div>
            <div className="mb-8">
              <button
                type="button"
                onClick={handleBack}
                className="flex items-center gap-2 text-label-large font-bold text-primary mb-6 hover:text-primary/80 transition-colors"
              >
                <ChevronLeft className="h-5 w-5" />
                {currentStep === 0 ? "Back to home" : "Back"}
              </button>
              <div className="w-12 h-1.5 rounded-full bg-primary mb-6"></div>
              <h1 className="text-display-small font-black text-on-surface mb-4">
                {currentStepData.leftHeading}
              </h1>
              <p className="text-body-large text-on-surface-variant">
                {currentStepData.leftSubtext}
              </p>
            </div>
            
            {/* Progress Bar */}
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-label-large font-bold text-on-surface">
                    Step {currentStep + 1} of {STEPS.length}
                  </span>
                  <span className="text-label-large font-bold text-primary">
                    {Math.round(((currentStep + 1) / STEPS.length) * 100)}%
                  </span>
                </div>
                <div className="h-2 w-full bg-surface-variant/30 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary rounded-full transition-all duration-300"
                    style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
                  />
                </div>
              </div>
              <div className="text-label-large font-bold text-on-surface">
                {currentStepData.title}
              </div>
            </div>
          </div>
          

        </div>
        
        {/* Right Panel - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-2xl mx-auto p-6 lg:p-12">
            {/* Mobile Header */}
            <div className="lg:hidden mb-8">
              <button
                type="button"
                onClick={handleBack}
                className="flex items-center gap-2 text-label-large font-bold text-primary mb-6 hover:text-primary/80 transition-colors"
              >
                <ChevronLeft className="h-5 w-5" />
                {currentStep === 0 ? "Back to home" : "Back"}
              </button>
              <div className="w-12 h-1.5 rounded-full bg-primary mb-4"></div>
              <h1 className="text-display-small font-black text-on-surface mb-2">
                {currentStepData.leftHeading}
              </h1>
              <p className="text-body-large text-on-surface-variant mb-6">
                {currentStepData.leftSubtext}
              </p>
              
              {/* Mobile Step Indicator */}
              <div className="flex items-center justify-between mb-8">
                <div className="text-label-large font-bold text-primary">
                  Step {currentStep + 1} of {STEPS.length}
                </div>
                <div className="text-label-large font-bold text-on-surface">
                  {currentStepData.title}
                </div>
              </div>
            </div>
            
            {/* Step Content */}
            {renderStepContent()}
            
            {/* Navigation Buttons */}
            <div className="sticky bottom-6 mt-12 pt-6 border-t border-outline-variant/30 bg-white/80 backdrop-blur-sm">
              <div className="flex justify-between items-center">
                 <button
                   type="button"
                   onClick={handleBack}
                   className="flex items-center gap-2 px-6 py-3 rounded-full border-2 border-outline-variant text-on-surface font-bold hover:border-primary hover:text-primary"
                 >
                   <ChevronLeft className="h-5 w-5" />
                   {currentStep === 0 ? "Back to home" : "Back"}
                 </button>
                
                <button
                  type="button"
                  onClick={handleContinue}
                  disabled={!isStepComplete() || isLoading}
                  className={cn(
                    "px-8 py-3 rounded-full font-bold transition-all flex items-center justify-center gap-2 min-w-[160px]",
                    isStepComplete() && !isLoading
                      ? "bg-primary text-white hover:bg-primary/90 shadow-lg"
                      : "bg-surface-variant/30 text-on-surface-variant cursor-not-allowed"
                  )}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {currentStep === STEPS.length - 2 ? "Submitting..." : "Loading..."}
                    </>
                  ) : (
                    <>
                      {currentStep === STEPS.length - 2
                        ? "Submit for review →"
                        : currentStep === STEPS.length - 1
                        ? "Done"
                        : "Continue →"
                      }
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}