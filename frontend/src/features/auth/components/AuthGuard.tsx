"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthSession } from "@/features/auth/context";
import { useTranslation } from "react-i18next";
import { LoadingState } from "@/shared/ui";

const AuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();
  const { isAuthenticated, isInitializing } = useAuthSession();
  const { t } = useTranslation(["resource-auth", "resource-common"]);

  useEffect(() => {
    if (!isInitializing && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, isInitializing, router]);

  if (isInitializing) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingState message={t("resource.auth.session.loading")} />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
};

export default AuthGuard;


