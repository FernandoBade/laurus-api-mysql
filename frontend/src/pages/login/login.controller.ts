import { AppRoutePath } from "@shared/enums/routes.enums";
import { ResourceKey } from "@shared/i18n/resource.keys";
import { navigate } from "@/routes/navigation";
import { login } from "@/services/auth/auth.service";

const LOGIN_ERROR_FALLBACK_MESSAGE = ResourceKey.INVALID_CREDENTIALS;

export interface LoginControllerDependencies {
    readonly setError: (value: ResourceKey | null) => void;
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

        dependencies.setError(result.messageKey ?? LOGIN_ERROR_FALLBACK_MESSAGE);
    };

    return {
        onSubmit,
    };
}
