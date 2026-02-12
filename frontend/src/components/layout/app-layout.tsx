import type { ComponentChildren } from "preact";
import { AppRoutePath } from "@shared/enums/routes.enums";
import { UI } from "@shared/enums/ui.enums";
import { Button } from "@/components/button/button";
import { navigate } from "@/routes/navigation";
import { toggleTheme } from "@/state/theme.store";

interface AppLayoutProps {
  readonly children: ComponentChildren;
}

export function AppLayout({ children }: AppLayoutProps) {
  const handleToggleTheme = (): void => {
    toggleTheme();
  };

  return (
    <div class="min-h-screen bg-base-100 text-base-content">
      <header class="border-b border-base-300 bg-base-200">
        <div class="mx-auto flex w-full max-w-6xl items-center justify-between gap-2 px-4 py-3 sm:px-6 lg:px-8">
          <div class="flex items-center gap-2">
            <Button variant={UI.ButtonVariant.GHOST} onClick={() => navigate(AppRoutePath.LOGIN)}>
              Login
            </Button>
            <Button variant={UI.ButtonVariant.GHOST} onClick={() => navigate(AppRoutePath.DASHBOARD)}>
              Dashboard
            </Button>
          </div>
          <Button variant={UI.ButtonVariant.SECONDARY} onClick={handleToggleTheme}>
            Toggle Theme
          </Button>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
