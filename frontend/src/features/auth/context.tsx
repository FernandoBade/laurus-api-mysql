"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import { refreshAccessToken } from "./api";
import { setUnauthorizedHandler } from "@/shared/lib/api/client";
import {
  clearAccessToken,
  getAccessToken,
  getUserId,
  setAccessToken,
} from "@/shared/lib/auth/session";

type AuthContextValue = {
  accessToken: string | null;
  userId: number | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  setSession: (token: string | null) => void;
  clearSession: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const queryClient = useQueryClient();
  const [accessTokenState, setAccessTokenState] = useState<string | null>(
    getAccessToken()
  );
  const [userIdState, setUserIdState] = useState<number | null>(getUserId());
  const [isInitializing, setIsInitializing] = useState(true);

  const setSession = useCallback((token: string | null) => {
    setAccessToken(token);
    setAccessTokenState(token);
    setUserIdState(getUserId());
  }, []);

  const clearSession = useCallback(() => {
    clearAccessToken();
    setAccessTokenState(null);
    setUserIdState(null);
    queryClient.clear();
  }, [queryClient]);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      clearSession();
      if (typeof window !== "undefined") {
        window.location.assign("/login");
      }
    });
  }, [clearSession]);

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const token = await refreshAccessToken();
        if (token) {
          setSession(token);
        }
      } catch {
        // Keep unauthenticated state when refresh fails.
      } finally {
        setIsInitializing(false);
      }
    };

    restoreSession();
  }, [setSession]);

  const value = useMemo(
    () => ({
      accessToken: accessTokenState,
      userId: userIdState,
      isAuthenticated: Boolean(accessTokenState),
      isInitializing,
      setSession,
      clearSession,
    }),
    [accessTokenState, userIdState, isInitializing, setSession, clearSession]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
