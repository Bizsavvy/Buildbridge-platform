import RegisterForm from "@/components/auth/RegisterForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Account | BuildBridge",
  description: "Join BuildBridge and start raising funding for your trade.",
};

export default function RegisterPage() {
  return (
    <div className="flex min-h-[calc(100vh-80px)] w-full flex-col items-center justify-center p-4">
      <RegisterForm />
    </div>
  );
}
