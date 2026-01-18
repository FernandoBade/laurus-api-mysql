import AlertsContent from "@/components/pages/AlertsContent";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Next.js Alerts | TailAdmin - Next.js Dashboard Template",
  description:
    "This is Next.js Alerts page for TailAdmin - Next.js Tailwind CSS Admin Dashboard Template",
  // other metadata
};

export default function Alerts() {
  return <AlertsContent />;
}
