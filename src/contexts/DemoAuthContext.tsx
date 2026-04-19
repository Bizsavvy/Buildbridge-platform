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

/**
 * Normalise a Nigerian phone number to E.164 format (client-side mirror
 * of the server-side helper so we can store a canonical phone in state).
 */
function toE164(phone: string): string {
  let cleaned = phone.replace(/[\s\-()]/g, "");
  if (cleaned.startsWith("0") && cleaned.length === 11) {
    return "+234" + cleaned.slice(1);
  }
  if (cleaned.startsWith("234") && !cleaned.startsWith("+")) {
    return "+" + cleaned;
  }
  if (!cleaned.startsWith("+")) {
    return "+234" + cleaned;
  }
  return cleaned;
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

      if (data.success) {
        return { success: true };
      }

      return { success: false, error: data.error || "Failed to send OTP." };
    } catch (err: any) {
      console.error("sendDemoOtp error:", err);
      return { success: false, error: "Network error. Please check your connection." };
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

      if (data.success && data.status === "approved") {
        const user: DemoUser = {
          name: name || (typeof window !== "undefined" ? localStorage.getItem("buildbridge_user_name") || undefined : undefined),
          phone: toE164(phone),
          verifiedAt: Date.now(),
        };

        setDemoUser(user);
        saveDemoUser(user);

        return { success: true };
      }

      return { success: false, error: data.error || "Invalid OTP. Please try again." };
    } catch (err: any) {
      console.error("verifyDemoOtp error:", err);
      return { success: false, error: "Network error. Please check your connection." };
    }
  }, []);

  // ── Email sign-in (demo mode — kept simple) ───────────────────────────────
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
