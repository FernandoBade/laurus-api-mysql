import LineChartContent from "@/components/pages/LineChartContent";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Next.js Line Chart | TailAdmin - Next.js Dashboard Template",
  description:
    "This is Next.js Line Chart page for TailAdmin - Next.js Tailwind CSS Admin Dashboard Template",
};
export default function LineChart() {
  return <LineChartContent />;
}
