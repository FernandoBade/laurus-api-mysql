"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useTranslation } from "react-i18next";

const AuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();
  const { isAuthenticated, isInitializing } = useAuth();
  const { t } = useTranslation(["resource-auth", "resource-common"]);

  useEffect(() => {
    if (!isInitializing && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, isInitializing, router]);

  if (isInitializing) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-sm text-gray-500 dark:text-gray-400">
        {t("resource.auth.session.loading")}
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
};

export default AuthGuard;
