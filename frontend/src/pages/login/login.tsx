import type { JSX } from "preact";
import { useMemo, useState } from "preact/hooks";
import { UI } from "@shared/enums/ui.enums";
import { Button } from "@/components/button/button";
import { PageContainer } from "@/components/page-container/page-container";
import { createLoginController } from "./login.controller";

export function LoginPage() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const controller = useMemo(() => createLoginController({ setError }), []);

  const handleSubmit = async (event: JSX.TargetedEvent<HTMLFormElement, Event>): Promise<void> => {
    event.preventDefault();
    setIsSubmitting(true);
    await controller.onSubmit(email, password);
    setIsSubmitting(false);
  };

  const handleEmailInput = (event: JSX.TargetedEvent<HTMLInputElement, Event>): void => {
    setEmail(event.currentTarget.value);
  };

  const handlePasswordInput = (event: JSX.TargetedEvent<HTMLInputElement, Event>): void => {
    setPassword(event.currentTarget.value);
  };

  return (
    <PageContainer>
      <div class="mx-auto w-full max-w-md">
        <h1 class="text-2xl font-semibold leading-tight">Login</h1>
        <p class="mt-2 text-sm text-slate-600">Foundation form with controller orchestration only.</p>

        <form class="mt-6 flex flex-col gap-4" onSubmit={handleSubmit}>
          <label class="flex flex-col gap-1 text-sm">
            <span>Email</span>
            <input
              type="email"
              value={email}
              onInput={handleEmailInput}
              autoComplete="email"
              required
              class="w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-base"
            />
          </label>

          <label class="flex flex-col gap-1 text-sm">
            <span>Password</span>
            <input
              type="password"
              value={password}
              onInput={handlePasswordInput}
              autoComplete="current-password"
              required
              class="w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-base"
            />
          </label>

          {error !== null ? <p class="text-sm text-red-600">{error}</p> : null}

          <Button type="submit" variant={UI.ButtonVariant.PRIMARY} loading={isSubmitting}>
            Continue
          </Button>
        </form>
      </div>
    </PageContainer>
  );
}
