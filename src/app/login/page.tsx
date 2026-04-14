import LoginForm from "@/components/auth/LoginForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login | BuildBridge",
  description: "Securely access your BuildBridge account.",
};

export default function LoginPage() {
  return (
    <div className="flex min-h-[calc(100vh-80px)] w-full flex-col items-center justify-center p-4">
      <LoginForm />
    </div>
  );
}
