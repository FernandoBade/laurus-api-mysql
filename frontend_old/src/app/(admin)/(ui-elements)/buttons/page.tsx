import ButtonsContent from "@/components/pages/ButtonsContent";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Next.js Buttons | TailAdmin - Next.js Dashboard Template",
  description:
    "This is Next.js Buttons page for TailAdmin - Next.js Tailwind CSS Admin Dashboard Template",
};

export default function Buttons() {
  return <ButtonsContent />;
}
