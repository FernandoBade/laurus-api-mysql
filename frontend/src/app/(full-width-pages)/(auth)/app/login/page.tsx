import React, { Suspense } from "react";
import SignInForm from "@/features/auth/components/SignInForm";

export default function LoginPage() {
  return (
    <Suspense fallback={<p className="text-sm text-gray-500">Loading...</p>}>
      <SignInForm />
    </Suspense>
  );
}
