"use client";

import * as React from "react"
import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Input } from "@/components/ui/Input"
import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import { Phone, ArrowRight, ShieldCheck, CheckCircle } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export default function RegisterForm() {
  const router = useRouter()
  const supabase = createClient()
  
  const [step, setStep] = useState<"phone" | "otp" | "success">("phone")
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  
  const [phone, setPhone] = useState("")
  const [formattedPhone, setFormattedPhone] = useState("")
  
  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const otpRefs = useRef<(HTMLInputElement | null)[]>([])
  
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

  const formatPhoneNumber = (raw: string): string => {
    const cleaned = raw.replace(/[^0-9]/g, "")
    if (cleaned.length === 11 && cleaned.startsWith("0")) {
      return `+234 ${cleaned.slice(1, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`
    }
    if (cleaned.length === 10) {
      return `+234 ${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`
    }
    return raw
  }

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMsg(null)

    const rawVal = phone.replace(/[^0-9]/g, "")
    if (rawVal.length < 10) {
      setErrorMsg("Please enter a valid Nigerian phone number.")
      setIsLoading(false)
      return
    }

    let cleanPhone = rawVal
    if (cleanPhone.startsWith("0") && cleanPhone.length === 11) {
      cleanPhone = "+234" + cleanPhone.slice(1)
    } else if (!cleanPhone.startsWith("+")) {
      cleanPhone = "+234" + cleanPhone
    }

    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone: cleanPhone,
      })

      if (error) {
        if (error.message?.includes("sms provider") || error.status === 400) {
          throw new Error("We couldn't send a text to that number. Please check for typos.")
        }
        throw new Error(error.message)
      }

      setFormattedPhone(formatPhoneNumber(rawVal))
      setStep("otp")
      setTimeLeft(300)
    } catch (err: any) {
      setErrorMsg(err.message || "Something went wrong. Please try again.")
    }
    setIsLoading(false)
  }

  const handleOtpChange = (index: number, value: string) => {
    if (!/^[0-9]*$/.test(value)) return

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

    let cleanPhone = formattedPhone.replace(/[^0-9]/g, "")
    if (cleanPhone.length === 11 && cleanPhone.startsWith("0")) {
      cleanPhone = "+234" + cleanPhone.slice(1)
    } else if (!cleanPhone.startsWith("+")) {
      cleanPhone = "+234" + cleanPhone
    }

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        phone: cleanPhone,
        token: token,
        type: "sms",
      })

      if (error) {
        throw new Error("The code entered is incorrect or has expired.")
      }

      if (data?.user) {
        setStep("success")
        setTimeout(() => {
          router.push("/onboarding")
        }, 2000)
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Invalid code. Please try again.")
      setIsLoading(false)
    }
  }

  const handleResend = async () => {
    if (timeLeft > 0 || isLoading) return
    setIsLoading(true)
    setErrorMsg(null)
    
    let cleanPhone = formattedPhone.replace(/[^0-9]/g, "")
    if (cleanPhone.startsWith("0") && cleanPhone.length === 11) {
      cleanPhone = "+234" + cleanPhone.slice(1)
    } else if (!cleanPhone.startsWith("+")) {
      cleanPhone = "+234" + cleanPhone
    }

    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone: cleanPhone,
      })

      if (error) {
        throw new Error(error.message)
      }

      setTimeLeft(300)
      setOtp(["", "", "", "", "", ""])
    } catch (err: any) {
      setErrorMsg(err.message || "Couldn't resend code. Please try again.")
    }
    setIsLoading(false)
  }

  if (step === "success") {
    return (
      <Card className="w-full max-w-md p-8 shadow-sm">
        <div className="flex flex-col gap-6 items-center text-center">
          <div className="w-16 h-16 bg-[var(--color-success)]/10 rounded-full flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-[var(--color-success)]" />
          </div>
          <div className="flex flex-col gap-2">
            <h1 className="text-headline-medium text-[var(--color-primary)]">Welcome to BuildBridge</h1>
            <p className="text-body-medium text-[var(--color-on-surface-variant)]">
              Your account is ready. Setting up your profile now...
            </p>
          </div>
          <div className="w-full bg-[var(--color-surface-variant)] rounded-full h-1 overflow-hidden">
            <div className="h-full bg-[var(--color-primary)] animate-pulse w-full" />
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md p-8 shadow-sm">
      {step === "phone" ? (
        <form onSubmit={handleSendOtp} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2 text-center">
            <h1 className="text-headline-medium text-[var(--color-primary)] font-bold">Create your account</h1>
            <p className="text-body-medium text-[var(--color-on-surface-variant)]">
              Enter your phone number to start. We will send a verification code.
            </p>
          </div>

          <div className="flex flex-col gap-1 relative">
            <div className="absolute left-4 top-[38px] text-[var(--color-on-surface-variant)] z-10 pointer-events-none">
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

          <Button 
            type="submit" 
            isLoading={isLoading} 
            className="w-full mt-2" 
            disabled={!phone || phone.replace(/[^0-9]/g, "").length < 10}
          >
            <span>Get Verification Code</span>
            {!isLoading && <ArrowRight className="ml-2 w-5 h-5" />}
          </Button>

          <div className="text-center text-body-small text-[var(--color-on-surface-variant)]">
            Already have an account?{" "}
            <Link href="/login" className="text-[var(--color-primary)] font-semibold hover:underline">
              Sign in
            </Link>
          </div>

          <div className="flex items-start gap-3 p-4 bg-[var(--color-surface-variant)] rounded-xl">
            <ShieldCheck className="w-5 h-5 text-[var(--color-primary)] flex-shrink-0 mt-0.5" />
            <p className="text-label-small text-[var(--color-on-surface-variant)]">
              Your number is safe with us. We only use it for verification and account recovery.
            </p>
          </div>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2 text-center">
             <div className="mx-auto w-12 h-12 bg-[var(--color-surface-variant)] rounded-full flex items-center justify-center text-[var(--color-primary)] mb-2">
               <ShieldCheck className="w-6 h-6" />
             </div>
            <h1 className="text-headline-medium text-[var(--color-primary)] font-bold">Verify your number</h1>
            <p className="text-body-medium text-[var(--color-on-surface-variant)]">
              We texted a 6-digit code to <strong className="text-[var(--color-on-surface)]">{formattedPhone}</strong>
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
                style={{ background: 'var(--color-surface)', color: 'var(--color-on-surface)' }}
                className={`w-12 h-14 text-center rounded-md border text-headline-small focus-visible:outline-none focus-visible:ring-2 transition-colors ${
                  errorMsg ? 'border-[var(--color-error)] focus-visible:ring-[var(--color-error)]' : 'border-[var(--color-outline)] focus-visible:border-transparent focus-visible:ring-[var(--color-primary)]'
                }`}
                disabled={isLoading}
              />
            ))}
          </div>

          {errorMsg && (
            <p className="text-body-small text-[var(--color-error)] text-center">{errorMsg}</p>
          )}

          <Button 
            type="submit" 
            isLoading={isLoading} 
            className="w-full mt-4" 
            disabled={otp.join("").length !== 6}
          >
            Verify & Create Account
          </Button>

          <div className="flex flex-col gap-3 mt-4 text-center items-center">
            {timeLeft > 0 ? (
              <p className="text-body-small text-[var(--color-on-surface-variant)]">
                Didn't get the code? Resend in <strong className="text-[var(--color-on-surface)] font-medium border-b border-[var(--color-on-surface-variant)]/30">{formatTime(timeLeft)}</strong>
              </p>
            ) : (
              <button 
                type="button" 
                onClick={handleResend}
                disabled={isLoading}
                className="text-body-small text-[var(--color-primary)] hover:underline font-medium"
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
              className="text-body-small text-[var(--color-on-surface)] hover:text-[var(--color-primary)] transition-colors"
            >
              Use a different phone number
            </button>
          </div>
        </form>
      )}
    </Card>
  )
}
