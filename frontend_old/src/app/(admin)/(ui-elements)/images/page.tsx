import ImagesContent from "@/components/pages/ImagesContent";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Next.js Images | TailAdmin - Next.js Dashboard Template",
  description:
    "This is Next.js Images page for TailAdmin - Next.js Tailwind CSS Admin Dashboard Template",
  // other metadata
};

export default function Images() {
  return <ImagesContent />;
}
