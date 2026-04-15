"use client";

import * as React from "react"
import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { Input } from "@/components/ui/Input"
import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import Link from "next/link"
import { Phone, ArrowRight, ShieldCheck } from "lucide-react"

export default function LoginForm() {
  const router = useRouter()
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
  const [timeLeft, setTimeLeft] = useState(300) // 5 minutes in seconds

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

  // Handle phone screen submission
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMsg(null)

    // Basic client validation
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
      setTimeLeft(300) // reset timer
    } else {
      setErrorMsg(error || "Something went wrong.")
    }
    setIsLoading(false)
  }

  // Handle individual digit input
  const handleOtpChange = (index: number, value: string) => {
    if (!/^[0-9]*$/.test(value)) return; // Only allow numbers

    const newOtp = [...otp]
    newOtp[index] = value.substring(value.length - 1) // strictly 1 char
    setOtp(newOtp)

    // Auto-advance
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus()
    }
  }

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Navigate backwards on backspace if current is empty
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
      
      // Auto-focus next empty or last
      const nextIndex = Math.min(pastedData.length, 5)
      otpRefs.current[nextIndex]?.focus()
    }
  }

  // Form submission for OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    const token = otp.join("")
    
    if (token.length !== 6) {
      setErrorMsg("Please enter all 6 digits.")
      return
    }

    setIsLoading(true)
    setErrorMsg(null)

    const { success, error, requiresOnboarding } = await verifyOTP(formattedPhone, token)

    if (success) {
      // Force NextJS to refresh server cache components for the new Session
      router.refresh()
      
      if (requiresOnboarding) {
        router.push("/onboarding")
      } else {
        router.push("/dashboard")
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
    <Card className="w-full max-w-md p-8 shadow-sm">
      {step === "phone" ? (
        <form onSubmit={handleSendOtp} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2 text-center">
            <h1 className="text-headline-medium text-primary">Log in</h1>
            <p className="text-body-medium text-on-surface-variant">
              Enter your phone number to continue to BuildBridge.
            </p>
          </div>

          <div className="flex flex-col gap-1 relative">
            <div className="absolute left-4 top-[38px] text-on-surface-variant z-10 pointer-events-none">
              <Phone className="w-5 h-5" />
            </div>
            <Input
              label="Phone Number"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="0801 234 5678"
              error={errorMsg || undefined}
              className="pl-12"
              required
            />
          </div>

          <Button type="submit" isLoading={isLoading} className="w-full mt-2" disabled={!phone}>
            <span>Continue</span>
            {!isLoading && <ArrowRight className="ml-2 w-5 h-5" />}
          </Button>

          <div className="text-center text-body-small text-on-surface-variant">
            New to BuildBridge?{" "}
            <Link href="/register" className="text-primary font-semibold hover:underline">
              Create an account
            </Link>
          </div>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2 text-center">
             <div className="mx-auto w-12 h-12 bg-surface-variant rounded-full flex items-center justify-center text-primary mb-2">
               <ShieldCheck className="w-6 h-6" />
             </div>
            <h1 className="text-headline-medium text-primary">Verify your number</h1>
            <p className="text-body-medium text-on-surface-variant">
              We texted a 6-digit code to <strong className="text-on-surface">{formattedPhone}</strong>
            </p>
          </div>

          <div className="flex justify-between gap-2 mt-4">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => {
                    otpRefs.current[index] = el
                }}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleOtpKeyDown(index, e)}
                onPaste={handleOtpPaste}
                autoFocus={index === 0}
                className={`w-12 h-14 text-center rounded-md border text-headline-small text-on-surface focus-visible:outline-none focus-visible:ring-2 bg-transparent transition-colors ${
                  errorMsg ? 'border-error focus-visible:ring-error text-error' : 'border-outline focus-visible:border-transparent focus-visible:ring-primary'
                }`}
                disabled={isLoading}
              />
            ))}
          </div>

          {errorMsg && (
            <p className="text-body-small text-error text-center">{errorMsg}</p>
          )}

          <Button type="submit" isLoading={isLoading} className="w-full mt-4" disabled={otp.join("").length !== 6}>
            Verify Code
          </Button>

          <div className="flex flex-col gap-3 mt-4 text-center items-center">
            {timeLeft > 0 ? (
              <p className="text-body-small text-on-surface-variant">
                Didn't get the code? Resend in <strong className="text-on-surface font-medium border-b border-on-surface-variant/30">{formatTime(timeLeft)}</strong>
              </p>
            ) : (
              <button 
                type="button" 
                onClick={handleResend}
                disabled={isLoading}
                className="text-body-small text-primary hover:underline font-medium"
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
              className="text-body-small text-on-surface hover:text-primary transition-colors"
            >
              Use a different phone number
            </button>
          </div>
        </form>
      )}
    </Card>
  )
}
