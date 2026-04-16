"use client";

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";

const DEMO_OTP = "123456";
const DEMO_USER_KEY = "buildbridge_demo_user";
const DEMO_OTP_KEY = "buildbridge_demo_otp";
const DEMO_COOKIE_NAME = "buildbridge_demo_session";

interface DemoUser {
  name?: string;
  phone?: string;
  email?: string;
  verifiedAt: number;
}

interface DemoOtpSession {
  phone: string;
  expiresAt: number;
}

interface DemoAuthContextType {
  isAuthenticated: boolean;
  demoUser: DemoUser | null;
  otpSession: DemoOtpSession | null;
  sendDemoOtp: (phone: string) => Promise<{ success: boolean; error?: string }>;
  verifyDemoOtp: (phone: string, token: string, name?: string) => Promise<{ success: boolean; error?: string }>;
  signInDemoEmail: (email: string, name?: string) => Promise<{ success: boolean; error?: string }>;
  clearDemoSession: () => void;
  signOut: () => void;
}

const DemoAuthContext = createContext<DemoAuthContextType | null>(null);

const SESSION_DURATION = 5 * 60 * 1000;

function loadDemoUser(): DemoUser | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(DEMO_USER_KEY);
    if (stored) {
      const user = JSON.parse(stored);
      // Fallback to persisted name if missing in user object
      if (!user.name) {
        user.name = localStorage.getItem("buildbridge_user_name") || undefined;
      }
      return user;
    }
  } catch {
    // ignore
  }
  return null;
}

function saveDemoUser(user: DemoUser | null) {
  if (typeof window === "undefined") return;
  try {
    if (user) {
      localStorage.setItem(DEMO_USER_KEY, JSON.stringify(user));
      // Set cookie for middleware (expires in 7 days)
      document.cookie = `${DEMO_COOKIE_NAME}=true; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
    } else {
      localStorage.removeItem(DEMO_USER_KEY);
      // Remove cookie
      document.cookie = `${DEMO_COOKIE_NAME}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    }
  } catch {
    // ignore
  }
}

function loadOtpSession(): DemoOtpSession | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(DEMO_OTP_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Date.now() < parsed.expiresAt) {
        return parsed;
      } else {
        localStorage.removeItem(DEMO_OTP_KEY);
      }
    }
  } catch {
    // ignore
  }
  return null;
}

function saveOtpSession(session: DemoOtpSession | null) {
  if (typeof window === "undefined") return;
  try {
    if (session) {
      localStorage.setItem(DEMO_OTP_KEY, JSON.stringify(session));
    } else {
      localStorage.removeItem(DEMO_OTP_KEY);
    }
  } catch {
    // ignore
  }
}

export function DemoAuthProvider({ children }: { children: ReactNode }) {
  const [demoUser, setDemoUser] = useState<DemoUser | null>(null);
  const [otpSession, setOtpSession] = useState<DemoOtpSession | null>(null);

  useEffect(() => {
    setDemoUser(loadDemoUser());
    setOtpSession(loadOtpSession());
  }, []);

  const sendDemoOtp = useCallback(async (phone: string) => {
    // Simulation delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    let cleanPhone = phone.trim();
    if (cleanPhone.startsWith("0") && cleanPhone.length === 11) {
      cleanPhone = "+234" + cleanPhone.slice(1);
    } else if (!cleanPhone.startsWith("+")) {
      cleanPhone = "+234" + cleanPhone;
    }

    const expiresAt = Date.now() + SESSION_DURATION;
    const session = {
      phone: cleanPhone,
      expiresAt,
    };
    
    setOtpSession(session);
    saveOtpSession(session);

    return { success: true };
  }, []);

  const verifyDemoOtp = useCallback(async (phone: string, token: string, name?: string) => {
    await new Promise((resolve) => setTimeout(resolve, 800));

    let cleanPhone = phone.trim();
    if (cleanPhone.startsWith("0") && cleanPhone.length === 11) {
      cleanPhone = "+234" + cleanPhone.slice(1);
    } else if (!cleanPhone.startsWith("+")) {
      cleanPhone = "+234" + cleanPhone;
    }

    // Check if session exists (either in state or loaded from storage)
    if (!otpSession || otpSession.phone !== cleanPhone) {
      return { success: false, error: "No OTP session found. Please request a new code." };
    }

    if (Date.now() > otpSession.expiresAt) {
      setOtpSession(null);
      saveOtpSession(null);
      return { success: false, error: "OTP has expired. Please request a new code." };
    }

    // MANDATORY DEMO RULE: Only 123456 is valid
    if (token !== DEMO_OTP) {
      return { success: false, error: "Invalid OTP. For demo purposes, use 123456." };
    }

    const user: DemoUser = {
      name: name || (typeof window !== "undefined" ? localStorage.getItem("buildbridge_user_name") || undefined : undefined),
      phone: cleanPhone,
      verifiedAt: Date.now(),
    };

    setOtpSession(null);
    saveOtpSession(null);
    setDemoUser(user);
    saveDemoUser(user);

    return { success: true };
  }, [otpSession]);

  const clearDemoSession = useCallback(() => {
    setOtpSession(null);
    saveOtpSession(null);
  }, []);

  const signInDemoEmail = useCallback(async (email: string, name?: string) => {
    // Simulation delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    const user: DemoUser = {
      name: name || (typeof window !== "undefined" ? localStorage.getItem("buildbridge_user_name") || undefined : undefined),
      email,
      verifiedAt: Date.now(),
    };

    setDemoUser(user);
    saveDemoUser(user);

    return { success: true };
  }, []);

  const signOut = useCallback(() => {
    setDemoUser(null);
    setOtpSession(null);
    saveDemoUser(null);
  }, []);

  return (
    <DemoAuthContext.Provider
      value={{
        isAuthenticated: demoUser !== null,
        demoUser,
        otpSession,
        sendDemoOtp,
        verifyDemoOtp,
        signInDemoEmail,
        clearDemoSession,
        signOut,
      }}
    >
      {children}
    </DemoAuthContext.Provider>
  );
}

export function useDemoAuth() {
  const context = useContext(DemoAuthContext);
  if (!context) {
    throw new Error("useDemoAuth must be used within a DemoAuthProvider");
  }
  return context;
}

export { DEMO_OTP };
