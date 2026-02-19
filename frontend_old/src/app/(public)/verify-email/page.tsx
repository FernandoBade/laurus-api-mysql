import AuthLayout from "@/app/(public)/(auth)/layout";
import VerifyEmailForm from "@/features/auth/components/VerifyEmailForm";
import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Verify Email | Zinero",
  description: "Verify your email address.",
};

export default function VerifyEmailPage() {
  return (
    <AuthLayout>
      <Suspense fallback={<p className="text-sm text-gray-500">Loading...</p>}>
        <VerifyEmailForm />
      </Suspense>
    </AuthLayout>
  );
}
