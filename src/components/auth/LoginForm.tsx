"use client";

import * as React from "react"
import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useDemoAuth } from "@/contexts/DemoAuthContext"
import { Input } from "@/components/ui/Input"
import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import Link from "next/link"
import { Phone, ArrowRight, ShieldCheck, Mail, Sparkles, Eye, EyeOff } from "lucide-react"
import { cn } from "@/lib/utils"

const DEMO_MODE = false

export default function LoginForm() {
  const router = useRouter()
  const { sendDemoOtp, verifyDemoOtp, signInDemoEmail } = useDemoAuth()

  // Method Selection
  const [method, setMethod] = useState<"phone" | "email">("phone")
  const [showPassword, setShowPassword] = useState(false)

  // View State
  const [step, setStep] = useState<"enter" | "otp">("enter")
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Phone State
  const [phone, setPhone] = useState("")
  const [formattedPhone, setFormattedPhone] = useState("")

  // Email State
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

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

  // OTP session is now managed server-side by Twilio Verify.
  // No client-side session resumption needed.

  const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60)
    const sec = seconds % 60
    return `${min}:${sec.toString().padStart(2, "0")}`
  }

  // Handle Phone Path
  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMsg(null)

    const result = await sendDemoOtp(phone)
    if (result.success) {
      let cleanPhone = phone.trim()
      if (cleanPhone.startsWith("0") && cleanPhone.length === 11) {
        cleanPhone = "+234" + cleanPhone.slice(1)
      } else if (!cleanPhone.startsWith("+")) {
        cleanPhone = "+234" + cleanPhone
      }
      setFormattedPhone(cleanPhone)
      setStep("otp")
      setTimeLeft(300)
    } else {
      setErrorMsg(result.error || "Failed to send OTP. Please try again.")
    }
    setIsLoading(false)
  }

  // Handle Email Path
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMsg(null)

    // Demo Mode: Accept any email/password
    const result = await signInDemoEmail(email)
    if (result.success) {
      router.push("/dashboard")
    } else {
      setErrorMsg(result.error || "Login failed.")
    }
    setIsLoading(false)
  }


  const handleOtpChange = (index: number, value: string) => {
    if (!/^[0-9]*$/.test(value)) return;
    const newOtp = [...otp]
    newOtp[index] = value.substring(value.length - 1)
    setOtp(newOtp)
    if (value && index < 5) otpRefs.current[index + 1]?.focus()
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

    const result = await verifyDemoOtp(formattedPhone, token)

    if (result.success) {
      router.push("/dashboard")
    } else {
      setErrorMsg(result.error || "Invalid OTP. Please try again.")
    }
    setIsLoading(false)
  }

  const handleResend = async () => {
    if (timeLeft > 0 || isLoading) return
    setIsLoading(true)
    setErrorMsg(null)
    const result = await sendDemoOtp(formattedPhone)
    if (result.success) {
      setTimeLeft(300)
    } else {
      setErrorMsg(result.error || "Couldn't resend code.")
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

          {/* Toggle Tabs */}
          <div className="flex p-1 bg-surface-variant/20 rounded-2xl border border-outline-variant shadow-inner">
            <button
              onClick={() => { setMethod("phone"); setErrorMsg(null); }}
              className={cn(
                "flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2",
                method === "phone" ? "bg-primary text-white shadow-xl" : "text-on-surface-variant hover:text-on-surface"
              )}
            >
              <Phone className="h-4 w-4" /> Phone
            </button>
            <button
              onClick={() => { setMethod("email"); setErrorMsg(null); }}
              className={cn(
                "flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2",
                method === "email" ? "bg-primary text-white shadow-xl" : "text-on-surface-variant hover:text-on-surface"
              )}
            >
              <Mail className="h-4 w-4" /> Email
            </button>
          </div>

          <form onSubmit={method === "phone" ? handlePhoneSubmit : handleEmailSubmit} className="flex flex-col gap-6">
            {method === "phone" ? (
              <div className="flex flex-col gap-2 relative">
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
            ) : (
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <Input
                    label="Email Address"
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setErrorMsg(null); }}
                    placeholder="you@example.com"
                    autoComplete="email"
                    error={method === 'email' && errorMsg && !password ? errorMsg : undefined}
                    className="h-16 rounded-3xl text-lg font-bold border-2 focus:border-primary transition-all"
                    required
                  />
                </div>
                <div className="flex flex-col gap-2 relative">
                  <Input
                    label="Password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setErrorMsg(null); }}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    error={errorMsg || undefined}
                    className="pr-14 h-16 rounded-3xl text-lg font-bold border-2 focus:border-primary transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-6 top-[42px] text-on-surface-variant hover:text-primary transition-colors focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
                  </button>
                </div>
              </div>
            )}

            <Button type="submit" isLoading={isLoading} className="h-16 rounded-full text-lg font-black shadow-xl shadow-primary/20">
              <span>Continue</span>
              {!isLoading && <ArrowRight className="ml-2 w-5 h-5" />}
            </Button>
          </form>


          <div className="text-center text-sm font-bold text-on-surface-variant/60 uppercase tracking-widest mt-2 px-2">
            New to BuildBridge?{" "}
            <Link href="/onboarding" className="text-primary font-black hover:underline ml-1">
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
                className={`w-full h-16 text-center rounded-2xl border-2 text-2xl font-black text-on-surface focus-visible:outline-none bg-surface-variant/20 transition-all ${errorMsg ? 'border-error text-error' : 'border-outline-variant focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/5'
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
