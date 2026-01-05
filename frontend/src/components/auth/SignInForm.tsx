"use client";
import Checkbox from "@/components/form/input/Checkbox";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import Alert from "@/components/ui/alert/Alert";
import Link from "next/link";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useLogin } from "@/api/auth.hooks";
import { useAuth } from "@/context/AuthContext";
import { getApiErrorMessage } from "@/api/errorHandling";
import { useTranslation } from "react-i18next";
import { Eye, EyeClosed, GoogleLogo, XLogo } from "@phosphor-icons/react";

export default function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const loginMutation = useLogin();
  const { setSession } = useAuth();
  const { t } = useTranslation(["resource-auth", "resource-common"]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email || !password) {
      setFormError(t("resource.auth.login.errors.missingCredentials"));
      return;
    }

    setFormError(null);
    try {
      const result = await loginMutation.mutateAsync({ email, password });
      const token = result.data?.token;
      if (result.success && token) {
        setSession(token);
        router.replace("/app/dashboard");
        return;
      }
      setFormError(
        result.message || t("resource.auth.login.errors.unableToSignIn")
      );
    } catch (error) {
      setFormError(
        getApiErrorMessage(error, t("resource.common.errors.generic"))
      );
    }
  };
  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full">
      <div className="w-full max-w-md sm:pt-10 mx-auto mb-5"></div>
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              {t("resource.auth.login.title")}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t("resource.auth.login.subtitle")}
            </p>
          </div>
          <div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-5">
              <button
                title={t("resource.auth.social.comingSoonTitle")}
                disabled
                className="inline-flex items-center justify-center gap-3 py-3 text-sm font-normal text-gray-700 transition-colors bg-gray-100 rounded-lg px-7 hover:bg-gray-200 hover:text-gray-800 dark:bg-white/5 dark:text-white/90 dark:hover:bg-white/10"
              >
                <GoogleLogo size={20} weight="fill" />
                <span className="decoration line-through">
                  {t("resource.auth.social.signInGoogle")}
                </span>
              </button>
              <button
                title={t("resource.auth.social.comingSoonTitle")}
                disabled
                className="inline-flex items-center justify-center gap-3 py-3 text-sm font-normal text-gray-700 transition-colors bg-gray-100 rounded-lg px-7 hover:bg-gray-200 hover:text-gray-800 dark:bg-white/5 dark:text-white/90 dark:hover:bg-white/10"
              >
                <XLogo size={20} weight="fill" />
                <span className="decoration line-through">
                  {t("resource.auth.social.signInX")}
                </span>
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
              <div className="space-y-6">
                {formError && (
                  <Alert
                    variant="error"
                    title={t("resource.auth.login.errors.title")}
                    message={formError}
                  />
                )}
                <div>
                  <Label>
                    {t("resource.common.fields.email")} <span className="text-error-500">*</span>{" "}
                  </Label>
                  <Input
                    placeholder={t("resource.auth.login.placeholders.email")}
                    type="email"
                    name="email"
                    onChange={(event) => setEmail(event.target.value)}
                  />
                </div>
                <div>
                  <Label>
                    {t("resource.common.fields.password")} <span className="text-error-500">*</span>{" "}
                  </Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder={t("resource.auth.login.placeholders.password")}
                      name="password"
                      onChange={(event) => setPassword(event.target.value)}
                    />
                    <span
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                      aria-label={t("resource.auth.login.togglePasswordAria")}
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
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Checkbox checked={isChecked} onChange={setIsChecked} />
                    <span className="block font-normal text-gray-700 text-theme-sm dark:text-gray-400">
                      {t("resource.auth.login.keepLoggedIn")}
                    </span>
                  </div>
                  <Link
                    href="/reset-password"
                    className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400"
                  >
                    {t("resource.auth.login.forgotPassword")}
                  </Link>
                </div>
                <div>
                  <Button
                    className="w-full"
                    size="sm"
                    disabled={loginMutation.isPending}
                  >
                    {loginMutation.isPending
                      ? t("resource.auth.login.actions.signingIn")
                      : t("resource.auth.login.actions.signIn")}
                  </Button>
                </div>
              </div>
            </form>

            <div className="mt-5">
              <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
                {t("resource.auth.login.noAccount")} {""}
                <Link
                  href="/app/register"
                  className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
                >
                  {t("resource.auth.login.actions.signUp")}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
