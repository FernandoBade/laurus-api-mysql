"use client";
import { useTheme } from "@/shared/context/ThemeContext";
import React from "react";
import { Moon, Sun } from "@phosphor-icons/react";

export default function ThemeTogglerTwo() {
  const { toggleTheme } = useTheme();
  return (
    <button
      onClick={toggleTheme}
      className="inline-flex size-14 items-center justify-center rounded-full bg-brand-500 text-white transition-colors hover:bg-brand-600"
    >
      <Sun size={20} weight="fill" className="hidden dark:block" />
      <Moon size={20} weight="fill" className="dark:hidden" />
    </button>
  );
}

