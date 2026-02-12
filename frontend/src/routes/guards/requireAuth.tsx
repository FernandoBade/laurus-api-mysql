import type { ComponentChildren } from "preact";
import { useEffect, useState } from "preact/hooks";
import { AppRoutePath } from "@shared/enums/routes.enums";
import { replace } from "@/routes/navigation";
import { isAuthenticated, subscribeAuthState } from "@/state/auth.store";

interface RequireAuthProps {
  readonly children: ComponentChildren;
}

export function RequireAuth({ children }: RequireAuthProps) {
  const [authenticated, setAuthenticated] = useState<boolean>(isAuthenticated());

  useEffect(() => {
    return subscribeAuthState(() => {
      setAuthenticated(isAuthenticated());
    });
  }, []);

  useEffect(() => {
    if (!authenticated) {
      replace(AppRoutePath.LOGIN);
    }
  }, [authenticated]);

  if (!authenticated) {
    return null;
  }

  return <>{children}</>;
}
