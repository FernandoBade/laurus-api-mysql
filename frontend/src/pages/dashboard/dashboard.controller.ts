import { Theme } from "@shared/enums/theme.enums";
import { navigate, SANDBOX_ROUTE_PATH } from "@/routes/navigation";
import { getTheme, toggleTheme } from "@/state/theme.store";

export interface DashboardController {
  readonly getCurrentTheme: () => Theme;
  readonly onToggleTheme: () => Theme;
  readonly onNavigateSandbox: () => void;
}

/**
 * @summary Builds dashboard view-model data and action handlers for the page.
 */

export function createDashboardController(): DashboardController {
  const getCurrentTheme = (): Theme => getTheme();

  const onToggleTheme = (): Theme => {
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
