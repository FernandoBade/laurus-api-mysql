"use client";

import React, { useEffect, useState } from "react";
import { I18nextProvider } from "react-i18next";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/context/ThemeContext";
import { SidebarProvider } from "@/context/SidebarContext";
import { AuthProvider } from "@/context/AuthContext";
import { getResourceLanguage, resourceI18n } from "../../i18n";

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  useEffect(() => {
    const updateDocumentLanguage = () => {
      document.documentElement.lang = getResourceLanguage();
    };

    updateDocumentLanguage();
    resourceI18n.on("languageChanged", updateDocumentLanguage);

    return () => {
      resourceI18n.off("languageChanged", updateDocumentLanguage);
    };
  }, []);

  return (
    <I18nextProvider i18n={resourceI18n}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ThemeProvider>
            <SidebarProvider>{children}</SidebarProvider>
          </ThemeProvider>
        </AuthProvider>
      </QueryClientProvider>
    </I18nextProvider>
  );
}
