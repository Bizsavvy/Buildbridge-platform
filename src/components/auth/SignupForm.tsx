"use client";

import * as React from "react"
import { useState, useRef, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { Input } from "@/components/ui/Input"
import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import { Phone, ArrowRight, ShieldCheck, Sparkles } from "lucide-react"
import Link from "next/link"

export default function SignupForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectPath = searchParams.get("redirect") || "/dashboard"
  
  const { signInWithPhone, verifyOTP } = useAuth()
  
  // View State
  const [step, setStep] = useState<"phone" | "otp">("phone")
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
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
    let timer: NodeJS.Timeout
    if (step === "otp" && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1)
      }, 1000)
    }
    return () => clearInterval(timer)
  }, [step, timeLeft])

  const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60)
    const sec = seconds % 60
    return `${min}:${sec.toString().padStart(2, "0")}`
  }

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMsg(null)

    const rawVal = phone.replace(/[^0-9+]/g, '')
    if (rawVal.length < 10) {
      setErrorMsg("Please enter a valid phone number.")
      setIsLoading(false)
      return
    }

    const { success, error, formattedPhone: sentPhone } = await signInWithPhone(rawVal)
    
    if (success) {
      setFormattedPhone(sentPhone || rawVal)
      setStep("otp")
      setTimeLeft(300)
    } else {
      setErrorMsg(error || "Something went wrong.")
    }
    setIsLoading(false)
  }

  const handleOtpChange = (index: number, value: string) => {
    if (!/^[0-9]*$/.test(value)) return;

    const newOtp = [...otp]
    newOtp[index] = value.substring(value.length - 1)
    setOtp(newOtp)

    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus()
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
      for (let i = 0; i < pastedData.length; i++) {
        newOtp[i] = pastedData[i]
      }
      setOtp(newOtp)
      const nextIndex = Math.min(pastedData.length, 5)
      otpRefs.current[nextIndex]?.focus()
    }
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    const token = otp.join("")
    
    if (token.length !== 6) {
      setErrorMsg("Please enter all 6 digits.")
      return
    }

    setIsLoading(true)
    setErrorMsg(null)

    // Using existing verifyOTP logic
    const { success, error, requiresOnboarding } = await verifyOTP(formattedPhone, token)

    if (success) {
      router.refresh()
      
      if (requiresOnboarding || redirectPath.includes("onboarding")) {
        router.push(redirectPath === "/dashboard" ? "/onboarding" : redirectPath)
      } else {
        router.push(redirectPath)
      }
    } else {
      setErrorMsg(error || "Invalid code.")
      setIsLoading(false)
    }
  }

  const handleResend = async () => {
    if (timeLeft > 0 || isLoading) return
    setIsLoading(true)
    setErrorMsg(null)
    
    const { success, error } = await signInWithPhone(formattedPhone)
    if (success) {
      setTimeLeft(300)
    } else {
      setErrorMsg(error || "Couldn't resend code.")
    }
    setIsLoading(false)
  }

  return (
    <Card className="w-full max-w-lg p-10 shadow-2xl rounded-[2.5rem] border-primary/10 overflow-hidden relative">
      <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
         <Sparkles className="w-24 h-24 text-primary" />
      </div>

      {step === "phone" ? (
        <form onSubmit={handleSendOtp} className="flex flex-col gap-8 relative z-10">
          <div className="flex flex-col gap-4 text-center">
            <span className="inline-block self-center px-4 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest border border-primary/10">
                Join the Network
            </span>
            <h1 className="text-4xl font-black text-on-surface tracking-tight">Create your <span className="text-primary italic">Account.</span></h1>
            <p className="text-on-surface-variant font-medium leading-relaxed">
              Enter your phone number to start your journey on BuildBridge.
            </p>
          </div>

          <div className="flex flex-col gap-2 relative">
            <div className="absolute left-6 top-[42px] text-on-surface-variant z-10 pointer-events-none">
              <Phone className="w-6 h-6" />
            </div>
            <Input
              label="Phone Number"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="0801 234 5678"
              error={errorMsg || undefined}
              className="pl-14 h-16 rounded-3xl text-lg font-bold border-2 focus:border-primary transition-all"
              required
            />
          </div>

          <div className="flex flex-col gap-4">
            <Button type="submit" isLoading={isLoading} className="h-16 rounded-full text-lg font-black shadow-xl shadow-primary/20">
              <span>Continue</span>
              {!isLoading && <ArrowRight className="ml-2 w-5 h-5" />}
            </Button>
            
            <p className="text-center text-sm text-on-surface-variant font-medium">
              Already have an account?{" "}
              <Link href="/login" className="text-primary font-black hover:underline">
                Log In
              </Link>
            </p>
          </div>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp} className="flex flex-col gap-8 relative z-10">
          <div className="flex flex-col gap-4 text-center">
             <div className="mx-auto w-16 h-16 bg-primary/5 rounded-full flex items-center justify-center text-primary mb-2 shadow-inner">
               <ShieldCheck className="w-8 h-8" />
             </div>
            <h1 className="text-4xl font-black text-on-surface tracking-tight">Verify Identity</h1>
            <p className="text-on-surface-variant font-medium">
              We texted a 6-digit verification code to <strong className="text-on-surface font-black">{formattedPhone}</strong>
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

          {errorMsg && (
            <p className="text-sm font-bold text-error text-center bg-error/5 py-2 rounded-xl border border-error/10">{errorMsg}</p>
          )}

          <div className="flex flex-col gap-6">
            <Button type="submit" isLoading={isLoading} className="h-16 rounded-full text-lg font-black shadow-xl" disabled={otp.join("").length !== 6}>
              Verify & Create Account
            </Button>

            <div className="flex flex-col gap-4 text-center items-center">
              {timeLeft > 0 ? (
                <p className="text-sm font-bold text-on-surface-variant/60 uppercase tracking-widest">
                  Resend code in <span className="text-primary">{formatTime(timeLeft)}</span>
                </p>
              ) : (
                <button 
                  type="button" 
                  onClick={handleResend}
                  disabled={isLoading}
                  className="text-sm font-black text-primary hover:underline uppercase tracking-widest"
                >
                  Resend SMS Code
                </button>
              )}
              
              <button 
                type="button" 
                onClick={() => {
                  setStep("phone")
                  setOtp(["", "", "", "", "", ""])
                  setErrorMsg(null)
                }}
                disabled={isLoading}
                className="text-xs font-black text-on-surface-variant hover:text-primary transition-colors uppercase tracking-widest"
              >
                Use a different number
              </button>
            </div>
          </div>
        </form>
      )}
    </Card>
  )
}
