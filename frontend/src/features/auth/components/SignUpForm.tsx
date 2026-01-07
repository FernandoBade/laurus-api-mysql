"use client";
import Checkbox from "@/components/form/input/Checkbox";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Alert from "@/components/ui/alert/Alert";
import Link from "next/link";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useRegister, useResendVerificationEmail } from "@/features/auth/hooks";
import { normalizeApiError } from "@/shared/lib/api/errors";
import { useTranslation } from "react-i18next";
import { CaretLeft, Eye, EyeClosed, GoogleLogo, XLogo } from "@phosphor-icons/react";

const RESEND_COOLDOWN_SECONDS = 60;

export default function SignUpForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [notVerifiedEmail, setNotVerifiedEmail] = useState<string | null>(null);
  const [resendSuccess, setResendSuccess] = useState<string | null>(null);
  const [resendError, setResendError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const registerMutation = useRegister();
  const resendMutation = useResendVerificationEmail();
  const router = useRouter();
  const { t } = useTranslation(["resource-auth", "resource-common"]);

  React.useEffect(() => {
    if (cooldown <= 0) {
      return;
    }
    const timer = setTimeout(() => {
      setCooldown((prev) => Math.max(prev - 1, 0));
    }, 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const resendDisabled = resendMutation.isPending || cooldown > 0;
  const resendLabel = React.useMemo(() => {
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

    const targetEmail = (notVerifiedEmail || email).trim();
    if (!targetEmail) {
      setResendError(t("resource.auth.verifyEmail.resend.errors.missingEmail"));
      return;
    }

    try {
      await resendMutation.mutateAsync({ email: targetEmail });
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

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    setNotVerifiedEmail(null);
    setResendError(null);
    setResendSuccess(null);

    if (!firstName || !lastName || !email || !password) {
      setFormError(t("resource.auth.register.errors.missingFields"));
      return;
    }

    if (!isChecked) {
      setFormError(t("resource.auth.register.errors.mustAcceptTerms"));
      return;
    }

    try {
      const result = await registerMutation.mutateAsync({
        firstName,
        lastName,
        email,
        password,
      });

      if (result.success) {
        const encodedEmail = encodeURIComponent(email.trim());
        router.replace(`/verify-email?email=${encodedEmail}&sent=1`);
        return;
      }
      setFormError(
        result.message || t("resource.auth.register.errors.unableToCreate")
      );
    } catch (error) {
      const normalized = normalizeApiError(
        error,
        t("resource.common.errors.generic")
      );
      if (normalized.code === "EMAIL_NOT_VERIFIED") {
        const errorEmail =
          typeof (normalized.data as { email?: string } | undefined)?.email ===
          "string"
            ? (normalized.data as { email?: string }).email
            : email;
        setNotVerifiedEmail(errorEmail?.trim() || null);
        setFormError(null);
        return;
      }
      setFormError(normalized.message);
    }
  };
  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full overflow-y-auto no-scrollbar">
      <div className="w-full max-w-md sm:pt-10 mx-auto mb-5">
        <Link
          href="/app/dashboard"
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <CaretLeft size={16} />
          {t("resource.auth.register.backToDashboard")}
        </Link>
      </div>
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              {t("resource.auth.register.title")}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t("resource.auth.register.subtitle")}
            </p>
          </div>
          <div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-5">
              <button className="inline-flex items-center justify-center gap-3 py-3 text-sm font-normal text-gray-700 transition-colors bg-gray-100 rounded-lg px-7 hover:bg-gray-200 hover:text-gray-800 dark:bg-white/5 dark:text-white/90 dark:hover:bg-white/10">
                <GoogleLogo size={20} weight="fill" />
                {t("resource.auth.social.signUpGoogle")}
              </button>
              <button className="inline-flex items-center justify-center gap-3 py-3 text-sm font-normal text-gray-700 transition-colors bg-gray-100 rounded-lg px-7 hover:bg-gray-200 hover:text-gray-800 dark:bg-white/5 dark:text-white/90 dark:hover:bg-white/10">
                <XLogo size={20} weight="fill" />
                {t("resource.auth.social.signUpX")}
              </button>
            </div>
            <div className="relative py-3 sm:py-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-800"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="p-2 text-gray-400 bg-white dark:bg-gray-900 sm:px-5 sm:py-2">
                  {t("resource.common.labels.or")}
                </span>
              </div>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="space-y-5">
                {formError && (
                  <Alert
                    variant="error"
                    title={t("resource.auth.register.errors.title")}
                    message={formError}
                  />
                )}
                {notVerifiedEmail && (
                  <Alert
                    variant="warning"
                    title={t("resource.auth.register.notVerified.title")}
                    message={
                      notVerifiedEmail
                        ? t("resource.auth.register.notVerified.messageWithEmail", {
                            email: notVerifiedEmail,
                          })
                        : t("resource.auth.register.notVerified.message")
                    }
                  />
                )}
                {notVerifiedEmail && (
                  <div className="space-y-3">
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
                    <button
                      type="button"
                      className="flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-white transition rounded-lg bg-brand-500 shadow-theme-xs hover:bg-brand-600 disabled:bg-brand-300"
                      onClick={handleResend}
                      disabled={resendDisabled}
                    >
                      {resendLabel}
                    </button>
                  </div>
                )}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div className="sm:col-span-1">
                    <Label>
                      {t("resource.common.fields.firstName")}
                      <span className="text-error-500">*</span>
                    </Label>
                    <Input
                      type="text"
                      id="fname"
                      name="firstName"
                      placeholder={t("resource.auth.register.placeholders.firstName")}
                      onChange={(event) => setFirstName(event.target.value)}
                    />
                  </div>
                  <div className="sm:col-span-1">
                    <Label>
                      {t("resource.common.fields.lastName")}
                      <span className="text-error-500">*</span>
                    </Label>
                    <Input
                      type="text"
                      id="lname"
                      name="lastName"
                      placeholder={t("resource.auth.register.placeholders.lastName")}
                      onChange={(event) => setLastName(event.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <Label>
                    {t("resource.common.fields.email")}
                    <span className="text-error-500">*</span>
                  </Label>
                  <Input
                    type="email"
                    id="email"
                    name="email"
                    placeholder={t("resource.auth.register.placeholders.email")}
                    onChange={(event) => setEmail(event.target.value)}
                  />
                </div>
                <div>
                  <Label>
                    {t("resource.common.fields.password")}
                    <span className="text-error-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      placeholder={t("resource.auth.register.placeholders.password")}
                      type={showPassword ? "text" : "password"}
                      name="password"
                      onChange={(event) => setPassword(event.target.value)}
                    />
                    <span
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                      aria-label={t("resource.auth.register.togglePasswordAria")}
                    >
                      {showPassword ? (
                        <Eye
                          size={20}
                          className="text-gray-500 dark:text-gray-400"
                        />
                      ) : (
                        <EyeClosed
                          size={20}
                          className="text-gray-500 dark:text-gray-400"
                        />
                      )}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Checkbox
                    className="w-5 h-5"
                    checked={isChecked}
                    onChange={setIsChecked}
                  />
                  <p className="inline-block font-normal text-gray-500 dark:text-gray-400">
                    {t("resource.auth.register.terms.prefix")} {" "}
                    <span className="text-gray-800 dark:text-white/90">
                      {t("resource.auth.register.terms.terms")}
                    </span>{" "}
                    {t("resource.auth.register.terms.and")} {" "}
                    <span className="text-gray-800 dark:text-white">
                      {t("resource.auth.register.terms.privacy")}
                    </span>
                  </p>
                </div>
                <div>
                  <button
                    className="flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-white transition rounded-lg bg-brand-500 shadow-theme-xs hover:bg-brand-600 disabled:bg-brand-300"
                    disabled={registerMutation.isPending}
                  >
                    {registerMutation.isPending
                      ? t("resource.auth.register.actions.creating")
                      : t("resource.auth.register.actions.signUp")}
                  </button>
                </div>
              </div>
            </form>

            <div className="mt-5">
              <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
                {t("resource.auth.register.hasAccount")} {" "}
                <Link
                  href="/app/login"
                  className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
                >
                  {t("resource.auth.register.actions.signIn")}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
