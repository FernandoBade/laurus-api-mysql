import { AppRoutePath } from "@shared/enums/routes.enums";

export interface RouteDefinition {
  readonly path: AppRoutePath;
  readonly title: string;
}

export const ROUTE_DEFINITIONS: Record<AppRoutePath, RouteDefinition> = {
  [AppRoutePath.LOGIN]: {
    path: AppRoutePath.LOGIN,
    title: "Login",
  },
  [AppRoutePath.DASHBOARD]: {
    path: AppRoutePath.DASHBOARD,
    title: "Dashboard",
  },
};
