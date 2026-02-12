import { AppRoutePath } from "@shared/enums/routes.enums";
import { navigate } from "@/routes/navigation";
import { login } from "@/services/auth/auth.service";

const LOGIN_ERROR_FALLBACK_MESSAGE = "Unable to authenticate. Please verify your credentials.";

export interface LoginControllerDependencies {
  readonly setError: (value: string | null) => void;
}

export interface LoginController {
  readonly onSubmit: (email: string, password: string) => Promise<void>;
}

export function createLoginController(dependencies: LoginControllerDependencies): LoginController {
  const onSubmit = async (email: string, password: string): Promise<void> => {
    dependencies.setError(null);

    const result = await login(email, password);
    if (result.success) {
      navigate(AppRoutePath.DASHBOARD);
      return;
    }

    dependencies.setError(result.message ?? LOGIN_ERROR_FALLBACK_MESSAGE);
  };

  return {
    onSubmit,
  };
}
