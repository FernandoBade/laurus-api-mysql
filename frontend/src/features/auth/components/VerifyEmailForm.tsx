"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { CaretLeft } from "@phosphor-icons/react";
import Alert from "@/components/ui/alert/Alert";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { LoadingState } from "@/components/ui/states";
import { normalizeApiError } from "@/shared/lib/api/errors";
import { useResendVerificationEmail, useVerifyEmail } from "@/features/auth/hooks";
import { useTranslation } from "react-i18next";

type VerifyStatus = "idle" | "loading" | "success" | "alreadyVerified" | "invalid" | "error";

const RESEND_COOLDOWN_SECONDS = 60;

export default function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const verifyMutation = useVerifyEmail();
  const resendMutation = useResendVerificationEmail();
  const { t } = useTranslation(["resource-auth", "resource-common"]);

  const token = (searchParams.get("token") ?? "").trim();
  const sent = ["1", "true"].includes((searchParams.get("sent") ?? "").toLowerCase());
  const queryEmail = (searchParams.get("email") ?? "").trim();

  const [verifyStatus, setVerifyStatus] = useState<VerifyStatus>(token ? "loading" : "idle");
  const [verifyMessage, setVerifyMessage] = useState<string | null>(null);
  const [verifiedEmail, setVerifiedEmail] = useState<string | null>(null);
  const [resendEmail, setResendEmail] = useState(queryEmail);
  const [hasEditedResendEmail, setHasEditedResendEmail] = useState(false);
  const [resendSuccess, setResendSuccess] = useState<string | null>(null);
  const [resendError, setResendError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const lastVerifiedTokenRef = useRef<string | null>(null);
  const effectiveResendEmail = hasEditedResendEmail
    ? resendEmail
    : queryEmail || resendEmail;
  const resolvedVerifyStatus = token ? verifyStatus : "idle";

  useEffect(() => {
    if (!token) {
      return;
    }
    if (lastVerifiedTokenRef.current === token) {
      return;
    }
    lastVerifiedTokenRef.current = token;

    const verify = async () => {
      setVerifyStatus("loading");
      setVerifyMessage(null);
      try {
        const result = await verifyMutation.mutateAsync({ token });
        const responseEmail =
          typeof result.data?.email === "string" ? result.data.email.trim() : "";
        if (responseEmail) {
          setVerifiedEmail(responseEmail);
        }
        if (result.data?.alreadyVerified) {
          setVerifyStatus("alreadyVerified");
          return;
        }
        setVerifyStatus("success");
      } catch (error) {
        const normalized = normalizeApiError(
          error,
          t("resource.common.errors.generic")
        );
        if (normalized.status === 400) {
          setVerifyStatus("invalid");
          setVerifyMessage(
            t("resource.auth.verifyEmail.status.invalid.message")
          );
          return;
        }
        setVerifyStatus("error");
        setVerifyMessage(t("resource.common.errors.generic"));
      }
    };

    void verify();
  }, [token, t, verifyMutation]);

  useEffect(() => {
    if (
      resolvedVerifyStatus !== "success" &&
      resolvedVerifyStatus !== "alreadyVerified"
    ) {
      return;
    }
    const params = new URLSearchParams();
    params.set("verified", "1");
    if (verifiedEmail) {
      params.set("email", verifiedEmail);
    }
    router.replace(`/app/login?${params.toString()}`);
  }, [router, resolvedVerifyStatus, verifiedEmail]);

  useEffect(() => {
    if (cooldown <= 0) {
      return;
    }
    const timer = setTimeout(() => {
      setCooldown((prev) => Math.max(prev - 1, 0));
    }, 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const resendDisabled = resendMutation.isPending || cooldown > 0;

  const resendLabel = useMemo(() => {
    if (resendMutation.isPending) {
      return t("resource.auth.verifyEmail.resend.actions.sending");
    }
    if (cooldown > 0) {
      return t("resource.auth.verifyEmail.resend.actions.cooldown", {
        seconds: cooldown,
      });
    }
    return t("resource.auth.verifyEmail.resend.actions.send");
  }, [cooldown, resendMutation.isPending, t]);

  const handleResend = async () => {
    setResendSuccess(null);
    setResendError(null);

    if (!effectiveResendEmail) {
      setResendError(t("resource.auth.verifyEmail.resend.errors.missingEmail"));
      return;
    }

    try {
      await resendMutation.mutateAsync({ email: effectiveResendEmail });
      setResendSuccess(t("resource.auth.verifyEmail.resend.success"));
      setCooldown(RESEND_COOLDOWN_SECONDS);
    } catch (error) {
      const normalized = normalizeApiError(
        error,
        t("resource.auth.verifyEmail.resend.errors.failed")
      );
      if (normalized.code === "EMAIL_VERIFICATION_COOLDOWN") {
        const cooldownSeconds = Number(
          (normalized.data as { cooldownSeconds?: number } | undefined)
            ?.cooldownSeconds ?? RESEND_COOLDOWN_SECONDS
        );
        setCooldown(cooldownSeconds);
        setResendError(
          t("resource.auth.verifyEmail.resend.errors.cooldown", {
            seconds: cooldownSeconds,
          })
        );
        return;
      }
      setResendError(t("resource.auth.verifyEmail.resend.errors.failed"));
    }
  };

  const showResend =
    resolvedVerifyStatus === "idle" ||
    resolvedVerifyStatus === "invalid" ||
    resolvedVerifyStatus === "error";
  const loginUrl = useMemo(() => {
    const params = new URLSearchParams();
    params.set("verified", "1");
    if (verifiedEmail) {
      params.set("email", verifiedEmail);
    }
    return `/app/login?${params.toString()}`;
  }, [verifiedEmail]);

  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full overflow-y-auto no-scrollbar">
      <div className="w-full max-w-md sm:pt-10 mx-auto mb-5">
        <Link
          href="/app/login"
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <CaretLeft size={16} />
          {t("resource.auth.verifyEmail.actions.backToLogin")}
        </Link>
      </div>
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              {t("resource.auth.verifyEmail.title")}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t("resource.auth.verifyEmail.subtitle")}
            </p>
          </div>

          <div className="space-y-4">
            {sent && !token && (
              <Alert
                variant="info"
                title={t("resource.auth.verifyEmail.sent.title")}
                message={t("resource.auth.verifyEmail.sent.message")}
              />
            )}

            {resolvedVerifyStatus === "loading" && (
              <LoadingState
                message={t("resource.auth.verifyEmail.status.loading")}
              />
            )}

            {resolvedVerifyStatus === "success" && (
              <Alert
                variant="success"
                title={t("resource.auth.verifyEmail.status.success.title")}
                message={t("resource.auth.verifyEmail.status.success.message")}
              />
            )}

            {resolvedVerifyStatus === "alreadyVerified" && (
              <Alert
                variant="info"
                title={t("resource.auth.verifyEmail.status.alreadyVerified.title")}
                message={t("resource.auth.verifyEmail.status.alreadyVerified.message")}
              />
            )}

            {resolvedVerifyStatus === "invalid" && (
              <Alert
                variant="error"
                title={t("resource.auth.verifyEmail.status.invalid.title")}
                message={
                  verifyMessage ??
                  t("resource.auth.verifyEmail.status.invalid.message")
                }
              />
            )}

            {resolvedVerifyStatus === "error" && (
              <Alert
                variant="error"
                title={t("resource.auth.verifyEmail.status.error.title")}
                message={verifyMessage ?? t("resource.common.errors.generic")}
              />
            )}
          </div>

          <div className="mt-6 space-y-3 text-sm text-gray-500 dark:text-gray-400">
            <p>{t("resource.auth.verifyEmail.tips.checkInbox")}</p>
            <p>{t("resource.auth.verifyEmail.tips.checkSpam")}</p>
            <p>{t("resource.auth.verifyEmail.tips.resend")}</p>
          </div>

          {showResend && (
            <div className="mt-6">
              <div className="mb-4">
                <h2 className="text-sm font-semibold text-gray-800 dark:text-white/90">
                  {t("resource.auth.verifyEmail.resend.title")}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t("resource.auth.verifyEmail.resend.subtitle")}
                </p>
              </div>
              <div className="space-y-4">
                <div>
                  <Label>
                    {t("resource.common.fields.email")}
                    <span className="text-error-500">*</span>
                  </Label>
                  <Input
                    type="email"
                    name="email"
                    placeholder={t("resource.auth.login.placeholders.email")}
                    value={effectiveResendEmail}
                    onChange={(event) => {
                      setResendEmail(event.target.value);
                      if (!hasEditedResendEmail) {
                        setHasEditedResendEmail(true);
                      }
                    }}
                  />
                </div>
                {resendError && (
                  <Alert
                    variant="error"
                    title={t("resource.auth.verifyEmail.resend.errors.title")}
                    message={resendError}
                  />
                )}
                {resendSuccess && (
                  <Alert
                    variant="success"
                    title={t("resource.auth.verifyEmail.resend.successTitle")}
                    message={resendSuccess}
                  />
                )}
                <Button
                  className="w-full"
                  size="sm"
                  onClick={handleResend}
                  disabled={resendDisabled}
                >
                  {resendLabel}
                </Button>
                <div className="text-center">
                  <Link
                    href="/app/login"
                    className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400"
                  >
                    {t("resource.auth.verifyEmail.actions.backToLogin")}
                  </Link>
                </div>
              </div>
            </div>
          )}

          {(resolvedVerifyStatus === "success" ||
            resolvedVerifyStatus === "alreadyVerified") && (
            <div className="mt-6">
              <Button
                className="w-full"
                size="sm"
                onClick={() => router.replace(loginUrl)}
              >
                {t("resource.auth.verifyEmail.actions.login")}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
