import LoginForm from "@/components/auth/LoginForm";
import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Login | BuildBridge",
  description: "Securely access your BuildBridge account.",
};

export default function LoginPage() {
  return (
    <div className="flex min-h-[calc(100vh-80px)] w-full flex-col items-center justify-center p-4">
      <Suspense fallback={<div className="h-96 w-full max-w-lg bg-white/50 animate-pulse rounded-[2.5rem]" />}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
