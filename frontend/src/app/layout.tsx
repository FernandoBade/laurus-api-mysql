import { Outfit } from 'next/font/google';
import './globals.css';
import "flatpickr/dist/flatpickr.css";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Providers from "./providers";

const outfit = Outfit({
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${outfit.className} dark:bg-gray-900`}>
        <Providers>{children}</Providers>
        <SpeedInsights />
      </body>
    </html>
  );
}
