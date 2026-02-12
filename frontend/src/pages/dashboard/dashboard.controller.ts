import { ThemeMode } from "@shared/enums/theme.enums";
import { getTheme, toggleTheme } from "@/state/theme.store";

export interface DashboardController {
  readonly getCurrentTheme: () => ThemeMode;
  readonly onToggleTheme: () => ThemeMode;
}

export function createDashboardController(): DashboardController {
  const getCurrentTheme = (): ThemeMode => getTheme();

  const onToggleTheme = (): ThemeMode => {
    toggleTheme();
    return getTheme();
  };

  return {
    getCurrentTheme,
    onToggleTheme,
  };
}
