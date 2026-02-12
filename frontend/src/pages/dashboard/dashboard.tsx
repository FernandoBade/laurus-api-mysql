import { useState } from "preact/hooks";
import { AppRoutePath } from "@shared/enums/routes.enums";
import { ThemeMode } from "@shared/enums/theme.enums";
import { UI } from "@shared/enums/ui.enums";
import { Button } from "@/components/button/button";
import { PageContainer } from "@/components/page-container/page-container";
import { navigate } from "@/routes/navigation";
import { createDashboardController } from "./dashboard.controller";

export function DashboardPage() {
  const controller = createDashboardController();
  const [theme, setTheme] = useState<ThemeMode>(controller.getCurrentTheme());

  const handleToggleTheme = (): void => {
    setTheme(controller.onToggleTheme());
  };

  return (
    <PageContainer>
      <div class="flex flex-col gap-4">
        <h1 class="text-2xl font-semibold leading-tight">Dashboard</h1>
        <p class="text-sm text-slate-600">
          Current theme: <strong>{theme}</strong>
        </p>
        <div class="flex flex-wrap gap-2">
          <Button variant={UI.ButtonVariant.SECONDARY} onClick={handleToggleTheme}>
            Toggle Theme
          </Button>
          <Button variant={UI.ButtonVariant.GHOST} onClick={() => navigate(AppRoutePath.LOGIN)}>
            Go to Login
          </Button>
        </div>
      </div>
    </PageContainer>
  );
}
