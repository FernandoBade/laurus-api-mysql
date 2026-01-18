import BadgesContent from "@/components/pages/BadgesContent";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Next.js Badge | TailAdmin - Next.js Dashboard Template",
  description:
    "This is Next.js Badge page for TailAdmin - Next.js Tailwind CSS Admin Dashboard Template",
  // other metadata
};

export default function BadgePage() {
  return <BadgesContent />;
}
