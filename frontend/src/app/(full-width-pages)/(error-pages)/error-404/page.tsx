import Error404Content from "@/components/pages/Error404Content";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Next.js Error 404 | TailAdmin - Next.js Dashboard Template",
  description:
    "This is Next.js Error 404 page for TailAdmin - Next.js Tailwind CSS Admin Dashboard Template",
};

export default function Error404() {
  return <Error404Content />;
}
