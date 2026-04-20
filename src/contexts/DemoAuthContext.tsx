"use client";

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";

const DEMO_USER_KEY = "buildbridge_demo_user";
const DEMO_COOKIE_NAME = "buildbridge_demo_session";

interface DemoUser {
  name?: string;
  phone?: string;
  email?: string;
  verifiedAt: number;
}

interface DemoAuthContextType {
  isAuthenticated: boolean;
  demoUser: DemoUser | null;
  sendDemoOtp: (phone: string) => Promise<{ success: boolean; error?: string }>;
  verifyDemoOtp: (phone: string, token: string, name?: string) => Promise<{ success: boolean; error?: string }>;
  signInDemoEmail: (email: string, name?: string) => Promise<{ success: boolean; error?: string }>;
  clearDemoSession: () => void;
  signOut: () => void;
}

const DemoAuthContext = createContext<DemoAuthContextType | null>(null);

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

export function DemoAuthProvider({ children }: { children: ReactNode }) {
  const [demoUser, setDemoUser] = useState<DemoUser | null>(null);

  useEffect(() => {
    setDemoUser(loadDemoUser());
  }, []);

  // ── REAL Twilio Verify: Send OTP ──────────────────────────────────────────
  const sendDemoOtp = useCallback(async (phone: string) => {
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      
      // Fallback to local demo mode if Twilio credentials are missing
      if (res.status === 500 && data.error && data.error.includes("Missing Twilio credentials")) {
         console.warn("Twilio credentials missing. Using local demo fallback.");
         return { success: true };
      }
      
      return data;
    } catch (error) {
      console.error("Failed to send demo OTP:", error);
      return { success: false, error: "Failed to send OTP. Please try again." };
    }
  }, []);

  // ── REAL Twilio Verify: Check OTP ─────────────────────────────────────────
  const verifyDemoOtp = useCallback(async (phone: string, token: string, name?: string) => {
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code: token }),
      });
      const data = await res.json();

      let isSuccess = data.success;
      
      // Fallback to local demo mode if Twilio credentials are missing
      if (res.status === 500 && data.error && data.error.includes("Missing Twilio credentials")) {
         if (token === "123456") {
             isSuccess = true;
         } else {
             return { success: false, error: "Invalid OTP. For demo purposes without Twilio, use 123456." };
         }
      }

      if (isSuccess) {
        let cleanPhone = phone.trim();
        if (cleanPhone.startsWith("0") && cleanPhone.length === 11) {
          cleanPhone = "+234" + cleanPhone.slice(1);
        } else if (!cleanPhone.startsWith("+")) {
          cleanPhone = "+234" + cleanPhone;
        }

        const user: DemoUser = {
          name: name || (typeof window !== "undefined" ? localStorage.getItem("buildbridge_user_name") || undefined : undefined),
          phone: cleanPhone,
          verifiedAt: Date.now(),
        };

        setDemoUser(user);
        saveDemoUser(user);

        return { success: true };
      }
      return { success: false, error: data.error || "Invalid OTP" };
    } catch (error) {
      console.error("Failed to verify demo OTP:", error);
      return { success: false, error: "Failed to verify OTP. Please try again." };
    }
  }, []);

  // ── Email sign-in (demo mode — kept simple) ───────────────────────────────
  const signInDemoEmail = useCallback(async (email: string, name?: string) => {
    // Simulation delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    try {
      const user: DemoUser = {
        name: name || (typeof window !== "undefined" ? localStorage.getItem("buildbridge_user_name") || undefined : undefined),
        email,
        verifiedAt: Date.now(),
      };

      setDemoUser(user);
      saveDemoUser(user);

      return { success: true };
    } catch (error) {
      console.error("Failed to sign in with email:", error);
      return { success: false, error: "Failed to sign in. Please try again." };
    }
  }, []);

  const clearDemoSession = useCallback(() => {
    // No OTP session state to clear anymore — Twilio manages it server-side
  }, []);

  const signOut = useCallback(() => {
    setDemoUser(null);
    saveDemoUser(null);
  }, []);

  return (
    <DemoAuthContext.Provider
      value={{
        isAuthenticated: demoUser !== null,
        demoUser,
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
