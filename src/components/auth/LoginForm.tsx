"use client";

import * as React from "react"
import { useState, useRef, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Input } from "@/components/ui/Input"
import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import Link from "next/link"
import { Phone, ArrowRight, ShieldCheck, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

export default function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  // View State
  const [step, setStep] = useState<"enter" | "otp">("enter")
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [oauthError, setOauthError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Phone State
  const [phone, setPhone] = useState("")
  const [formattedPhone, setFormattedPhone] = useState("")

  // OTP State
  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const otpRefs = useRef<(HTMLInputElement | null)[]>([])

  // Timer State
  const [timeLeft, setTimeLeft] = useState(300)

  useEffect(() => {
    let timer: any
    if (step === "otp" && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1)
      }, 1000)
    }
    return () => clearInterval(timer)
  }, [step, timeLeft])

  // Check for OAuth errors on mount
  useEffect(() => {
    const error = searchParams?.get('error')
    const email = searchParams?.get('email')
    
    if (error === 'no_account') {
      const message = email 
        ? `No account found with email ${email}. Please sign up first.`
        : 'No account found. Please sign up first.'
      setOauthError(message)
      // Clear any URL params to prevent showing again on refresh
      const newUrl = new URL(window.location.href)
      newUrl.searchParams.delete('error')
      newUrl.searchParams.delete('email')
      window.history.replaceState({}, '', newUrl.toString())
    }
  }, [searchParams])

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
      
      setOauthError(`Google OAuth failed: ${decodedError || 'Unknown error'}`);
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

  // Sign in existing user with phone
  const signInUserWithPhone = async (phoneNumber: string): Promise<boolean> => {
    try {
      const email = `${phoneNumber.replace(/[^0-9]/g, '')}@buildbridge.app`
      const password = `buildbridge-${phoneNumber.replace(/[^0-9]/g, '')}`
      
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      
      if (error) {
        console.error('Sign in failed:', error)
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
    setOauthError(null)
    try {
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
      const redirectTo = `${baseUrl}/auth/callback?next=/dashboard&flow=login`
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

  // Handle Phone Login - send OTP via Twilio
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
        // OTP verified - sign in Supabase user
        const authSuccess = await signInUserWithPhone(formattedPhone)
        if (authSuccess) {
          router.push("/dashboard")
        } else {
          setErrorMsg("Account not found. Please sign up first.")
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
           <div className="flex flex-col gap-3 text-center">
             <h1 className="text-4xl font-black text-on-surface tracking-tight">Welcome <span className="text-primary italic">Back.</span></h1>
             <p className="text-on-surface-variant font-medium leading-relaxed">
               Securely access your BuildBridge account.
             </p>
           </div>

           {oauthError && (
             <div className="p-4 bg-error/5 border border-error/20 rounded-2xl text-center">
               <p className="text-error font-bold mb-2">{oauthError}</p>
               <Link href="/signup" className="text-primary font-black hover:underline">
                 Sign up here
               </Link>
             </div>
           )}

            <div className="flex flex-col gap-4">
             <Button onClick={handleGoogleAuth} isLoading={isLoading} className="h-16 rounded-2xl bg-surface border-2 border-outline-variant text-on-surface hover:bg-surface-variant justify-center gap-3 font-bold text-lg shadow-sm">
                <svg width="24" height="24" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                Continue with Google
             </Button>
             <div className="relative flex items-center py-4">
                <div className="flex-grow border-t border-outline-variant/50"></div>
                <span className="flex-shrink-0 mx-4 text-on-surface-variant text-label-small font-bold uppercase tracking-widest">OR</span>
                <div className="flex-grow border-t border-outline-variant/50"></div>
             </div>
           </div>

           <form onSubmit={handlePhoneSubmit} className="flex flex-col gap-6">
             <div className="flex flex-col gap-2 relative">
               <Input
                 label="Phone Number"
                 type="tel"
                 value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value)
                    if (oauthError) setOauthError(null)
                  }}
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
               disabled={phone.length < 10}
             >
               <span>Continue</span>
               {!isLoading && <ArrowRight className="ml-2 w-5 h-5" />}
             </Button>
           </form>

           <div className="text-center text-sm font-bold text-on-surface-variant/60 uppercase tracking-widest mt-2 px-2">
             New to BuildBridge?{" "}
             <Link href="/signup" className="text-primary font-black hover:underline ml-1">
               Create an account
             </Link>
           </div>
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
              Verify Code
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
