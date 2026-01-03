import VideosContent from "@/components/pages/VideosContent";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Next.js Videos | TailAdmin - Next.js Dashboard Template",
  description:
    "This is Next.js Videos page for TailAdmin - Next.js Tailwind CSS Admin Dashboard Template",
};

export default function VideoPage() {
  return <VideosContent />;
}
