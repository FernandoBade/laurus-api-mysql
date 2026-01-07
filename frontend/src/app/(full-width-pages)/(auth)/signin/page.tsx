import SignInForm from "@/features/auth/components/SignInForm";
import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Next.js SignIn Page | TailAdmin - Next.js Dashboard Template",
  description: "This is Next.js Signin Page TailAdmin Dashboard Template",
};

export default function SignIn() {
  return (
    <Suspense fallback={<p className="text-sm text-gray-500">Loading...</p>}>
      <SignInForm />
    </Suspense>
  );
}
