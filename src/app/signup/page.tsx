import SignupForm from "@/components/auth/SignupForm";
import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Join the Network | BuildBridge",
  description: "Create your artisan account and start building your legacy.",
};

export default function SignupPage() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-6 bg-surface relative overflow-hidden">
        {/* Background Decor */}
        <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[120px]" />
            <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] rounded-full bg-tertiary/10 blur-[120px]" />
        </div>

        <div className="w-full max-w-7xl relative z-10 flex flex-col items-center">
            <Suspense fallback={<div className="h-96 w-full max-w-lg bg-white/50 animate-pulse rounded-[2.5rem]" />}>
                <SignupForm />
            </Suspense>

            <p className="mt-12 text-[10px] font-black uppercase tracking-[0.4em] text-on-surface-variant/40">
                Pockets of Trust Building Communities
            </p>
        </div>
    </div>
  );
}
