import AvatarsContent from "@/components/pages/AvatarsContent";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Next.js Avatars | TailAdmin - Next.js Dashboard Template",
  description:
    "This is Next.js Avatars page for TailAdmin - Next.js Tailwind CSS Admin Dashboard Template",
};

export default function AvatarPage() {
  return <AvatarsContent />;
}
