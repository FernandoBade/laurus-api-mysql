import { ThemeMode } from "@shared/enums/theme.enums";
import { navigate, SANDBOX_ROUTE_PATH } from "@/routes/navigation";
import { getTheme, toggleTheme } from "@/state/theme.store";

export interface DashboardController {
  readonly getCurrentTheme: () => ThemeMode;
  readonly onToggleTheme: () => ThemeMode;
  readonly onNavigateSandbox: () => void;
}

export function createDashboardController(): DashboardController {
  const getCurrentTheme = (): ThemeMode => getTheme();

  const onToggleTheme = (): ThemeMode => {
    toggleTheme();
    return getTheme();
  };

  const onNavigateSandbox = (): void => {
    navigate(SANDBOX_ROUTE_PATH);
  };

  return {
    getCurrentTheme,
    onToggleTheme,
    onNavigateSandbox,
  };
}
