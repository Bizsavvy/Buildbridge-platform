"use client";

import * as React from "react"
import { useState, useRef, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Input } from "@/components/ui/Input"
import { Button } from "@/components/ui/Button"
import { adminSyncPhoneUser } from "@/app/actions/auth"
import { Card } from "@/components/ui/Card"
import { Phone, ArrowRight, ShieldCheck, Sparkles } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

export default function SignupForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectPath = searchParams.get("redirectTo") || searchParams.get("redirect") || "/dashboard"
  const supabase = createClient()
  
  // View State
  const [step, setStep] = useState<"enter" | "otp">("enter")
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  
  // Form State
  const [fullName, setFullName] = useState("")
  const [phone, setPhone] = useState("")
  const [formattedPhone, setFormattedPhone] = useState("")
  
  // OTP State
  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const otpRefs = useRef<(HTMLInputElement | null)[]>([])
  
  // Timer State
  const [timeLeft, setTimeLeft] = useState(300)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const onboardingDataRaw = localStorage.getItem("buildbridge_onboarding_data");
      if (onboardingDataRaw) {
        try {
          const data = JSON.parse(onboardingDataRaw);
          if (data.full_name) setFullName(data.full_name);
          if (data.phone) setPhone(data.phone);
        } catch (e) {
          console.error("Error parsing onboarding data", e);
        }
      } else {
        const stored = localStorage.getItem("buildbridge_temp_name");
        if (stored) setFullName(stored);
      }
    }
  }, [])

  useEffect(() => {
    let timer: any
    if (step === "otp" && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1)
      }, 1000)
    }
    return () => clearInterval(timer)
  }, [step, timeLeft])

  // Scroll to top when view changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: 'instant' })
    }
  }, [step])

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
      
      setErrorMsg(`Google OAuth failed: ${decodedError || 'Unknown error'}`);
      // Clear hash
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }
  }, [])

  const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60)
    const sec = seconds % 60
    return `${min}:${sec.toString().padStart(2, "0")}`
  }

  // Format phone for Twilio
  const formatPhone = (raw: string) => {
    let cleanPhone = raw.trim()
    if (cleanPhone.startsWith("0") && cleanPhone.length === 11) {
      cleanPhone = "+234" + cleanPhone.slice(1)
    } else if (!cleanPhone.startsWith("+")) {
      cleanPhone = "+234" + cleanPhone
    }
    return cleanPhone
  }

  // Create or sign in Supabase user with phone
  const createOrSignInUserWithPhone = async (phoneNumber: string): Promise<boolean> => {
    try {
      const email = `${phoneNumber.replace(/[^0-9]/g, '')}@buildbridge.app`
      const password = `buildbridge-${phoneNumber.replace(/[^0-9]/g, '')}`
      
      const syncResult = await adminSyncPhoneUser(phoneNumber, fullName.trim())
      if (!syncResult.success) {
        console.error("Failed to sync user via admin API:", syncResult.error)
        return false
      }
      
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (signInError) {
        console.error("Sign in failed:", signInError)
        return false
      }
      
      const { data: { session } } = await supabase.auth.getSession()
      return !!session
    } catch (error) {
      console.error('Error in phone user auth:', error)
      return false
    }
  }

  // Handle Google OAuth
  const handleGoogleAuth = async () => {
    setIsLoading(true)
    setErrorMsg(null)
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
      setErrorMsg('Failed to sign in with Google. Please check your configuration and try again.')
      setIsLoading(false)
    }
  }

  // Handle Phone Signup - send OTP via Twilio
  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMsg(null)

    const cleanPhone = formatPhone(phone)
    
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: cleanPhone })
      })
      
      const data = await res.json()
      
      if (!res.ok || !data.success) {
        setErrorMsg(data.error || "Failed to send OTP. Please try again.")
      } else {
        setFormattedPhone(cleanPhone)
        setStep("otp")
        setTimeLeft(300)
      }
    } catch (error) {
      setErrorMsg("Network error. Please check your connection.")
    }
    
    setIsLoading(false)
  }

  const handleOtpChange = (index: number, value: string) => {
    if (!/^[0-9]*$/.test(value)) return;
    const newOtp = [...otp]
    newOtp[index] = value.substring(value.length - 1)
    setOtp(newOtp)
    if (value && index < 5) otpRefs.current[index + 1]?.focus()
    
    // Auto-submit when all 6 digits entered
    const joined = newOtp.join("")
    if (joined.length === 6) {
      handleVerifyOtpDirect(joined)
    }
  }

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus()
    }
  }

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData("text").replace(/[^0-9]/g, "").slice(0, 6)
    if (pastedData) {
      const newOtp = [...otp]
      for (let i = 0; i < pastedData.length; i++) newOtp[i] = pastedData[i]
      setOtp(newOtp)
      const nextIndex = Math.min(pastedData.length, 5)
      otpRefs.current[nextIndex]?.focus()
      
      if (pastedData.length === 6) {
        handleVerifyOtpDirect(pastedData)
      }
    }
  }

  // Direct verify (called by auto-submit)
  const handleVerifyOtpDirect = async (code: string) => {
    setIsLoading(true)
    setErrorMsg(null)

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: formattedPhone, code })
      })
      
      const data = await res.json()
      
      if (!res.ok || !data.success) {
        setErrorMsg(data.error || "Invalid code. Please try again.")
      } else {
        // OTP verified - create or sign in Supabase user
        const authSuccess = await createOrSignInUserWithPhone(formattedPhone)
        if (authSuccess) {
          localStorage.removeItem("buildbridge_temp_name")
          localStorage.removeItem("buildbridge_onboarding_data")
          router.push(redirectPath)
        } else {
          setErrorMsg("Failed to create account. Please try again.")
        }
      }
    } catch (error) {
      setErrorMsg("Network error. Please try again.")
    }
    
    setIsLoading(false)
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    const token = otp.join("")
    if (token.length !== 6) {
      setErrorMsg("Please enter all 6 digits.")
      return
    }
    await handleVerifyOtpDirect(token)
  }

  const handleResend = async () => {
    if (timeLeft > 0 || isLoading) return
    setIsLoading(true)
    setErrorMsg(null)
    
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: formattedPhone })
      })
      
      const data = await res.json()
      
      if (!res.ok || !data.success) {
        setErrorMsg(data.error || "Couldn't resend code.")
      } else {
        setTimeLeft(300)
      }
    } catch (error) {
      setErrorMsg("Network error. Please try again.")
    }
    
    setIsLoading(false)
  }

  return (
    <Card className="w-full max-w-lg p-10 shadow-2xl rounded-[2.5rem] border-primary/10 overflow-hidden relative">
      <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
         <Sparkles className="w-24 h-24 text-primary" />
      </div>

      {step === "enter" ? (
        <div className="flex flex-col gap-8 relative z-10">
          <div className="flex flex-col gap-4 text-center">
            <span className="inline-block self-center px-4 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest border border-primary/10">
                Join the Network
            </span>
            <h1 className="text-4xl font-black text-on-surface tracking-tight">Create your <span className="text-primary italic">Account.</span></h1>
            <p className="text-on-surface-variant font-medium leading-relaxed">
              Start your journey and build trust with your community.
            </p>
          </div>

          <form onSubmit={handlePhoneSubmit} className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <Input
                label="Full Name"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. John Doe"
                autoComplete="name"
                className="h-16 rounded-3xl text-lg font-bold border-2 focus:border-primary transition-all"
                required
              />
            </div>
            
            <div className="flex flex-col gap-2">
              <Input
                label="Phone Number"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0801 234 5678"
                autoComplete="tel"
                error={errorMsg || undefined}
                className="h-16 rounded-3xl text-lg font-bold border-2 focus:border-primary transition-all"
                required
              />
            </div>

            <Button 
              type="submit" 
              isLoading={isLoading} 
              className="h-16 rounded-full text-lg font-black shadow-xl shadow-primary/20"
              disabled={fullName.trim().length < 2 || phone.length < 10}
            >
              <span>Continue</span>
              {!isLoading && <ArrowRight className="ml-2 w-5 h-5" />}
            </Button>
            
            <p className="text-center text-sm font-bold text-on-surface-variant/60 uppercase tracking-widest">
              Already have an account?{" "}
              <Link href="/login" className="text-primary font-black hover:underline">Log In</Link>
            </p>
          </form>
        </div>
      ) : (
        <form onSubmit={handleVerifyOtp} className="flex flex-col gap-8 relative z-10">
          <div className="flex flex-col gap-4 text-center">
             <div className="mx-auto w-16 h-16 bg-primary/5 rounded-full flex items-center justify-center text-primary mb-2 shadow-inner">
               <ShieldCheck className="w-8 h-8" />
             </div>
            <h1 className="text-4xl font-black text-on-surface tracking-tight">Verify Identity</h1>
            <p className="text-on-surface-variant font-medium leading-relaxed">
              We texted a code to <strong className="text-on-surface">{formattedPhone}</strong>
            </p>
          </div>

          <div className="flex justify-between gap-3 px-2">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => { otpRefs.current[index] = el }}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleOtpKeyDown(index, e)}
                onPaste={handleOtpPaste}
                autoFocus={index === 0}
                className={`w-full h-16 text-center rounded-2xl border-2 text-2xl font-black text-on-surface focus-visible:outline-none bg-surface-variant/20 transition-all ${
                  errorMsg ? 'border-error text-error' : 'border-outline-variant focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/5'
                }`}
                disabled={isLoading}
              />
            ))}
          </div>

          {errorMsg && <p className="text-sm font-bold text-error text-center bg-error/5 py-2 rounded-xl border border-error/10">{errorMsg}</p>}

          <div className="flex flex-col gap-6">
            <Button type="submit" isLoading={isLoading} className="h-16 rounded-full text-lg font-black shadow-xl" disabled={otp.join("").length !== 6}>
              Verify & Create Account
            </Button>
            <div className="flex flex-col gap-4 text-center items-center">
              {timeLeft > 0 ? (
                <p className="text-sm font-bold text-on-surface-variant/60 uppercase tracking-widest">
                  Resend in <span className="text-primary">{formatTime(timeLeft)}</span>
                </p>
              ) : (
                <button type="button" onClick={handleResend} disabled={isLoading} className="text-sm font-black text-primary hover:underline uppercase tracking-widest">Resend Code</button>
              )}
              <button 
                type="button" 
                onClick={() => { setStep("enter"); setOtp(["", "", "", "", "", ""]); setErrorMsg(null); }}
                disabled={isLoading}
                className="text-xs font-black text-on-surface-variant hover:text-primary transition-colors uppercase tracking-widest"
              >Use different number</button>
            </div>
          </div>
        </form>
      )}
    </Card>
  )
}
