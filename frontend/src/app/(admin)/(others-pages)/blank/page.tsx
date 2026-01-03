import BlankContent from "@/components/pages/BlankContent";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Next.js Blank Page | TailAdmin - Next.js Dashboard Template",
  description: "This is Next.js Blank Page TailAdmin Dashboard Template",
};

export default function BlankPage() {
  return <BlankContent />;
}
