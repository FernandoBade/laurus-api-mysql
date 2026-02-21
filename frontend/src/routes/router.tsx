import { AppRoutePath } from "@shared/enums/routes.enums";
import { Route, Switch } from "wouter-preact";
import { AppLayout } from "@/components/layout/app-layout";
import { DashboardPage } from "@/pages/dashboard/dashboard";
import { LoginPage } from "@/pages/login/login";
import { SandboxPage } from "@/pages/sandbox/sandbox";
import { RequireAuth } from "@/routes/guards/requireAuth";
import { SANDBOX_ROUTE_PATH } from "@/routes/navigation";

/**
 * @summary Builds the application route tree and guarded routes.
 */
export function AppRouter() {
  return (
    <AppLayout>
      <Switch>
        <Route path={AppRoutePath.LOGIN} component={LoginPage} />
        <Route path={AppRoutePath.DASHBOARD}>
          <RequireAuth>
            <DashboardPage />
          </RequireAuth>
        </Route>
        <Route path={SANDBOX_ROUTE_PATH}>
          <RequireAuth>
            <SandboxPage />
          </RequireAuth>
        </Route>
        <Route component={LoginPage} />
      </Switch>
    </AppLayout>
  );
}
