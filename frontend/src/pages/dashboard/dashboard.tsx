import type { JSX } from "preact";
import { useState } from "preact/hooks";
import { AppRoutePath } from "@shared/enums/routes.enums";
import { Theme } from "@shared/enums/theme.enums";
import { ResourceKey } from "@shared/i18n/resource.keys";
import { IconName } from "@shared/enums/icon.enums";
import { ButtonVariant } from "@shared/enums/ui.enums";
import { Button } from "@/components/button/button";
import { Card } from "@/components/card/card";
import { PageContainer } from "@/components/page-container/page-container";
import { navigate } from "@/routes/navigation";
import { createDashboardController } from "@/pages/dashboard/dashboard.controller";

const DASHBOARD_TITLE = ResourceKey.FIELD_LABEL_THEME;
const TOGGLE_THEME_LABEL = ResourceKey.FIELD_LABEL_THEME;
const LOGIN_ROUTE_LABEL = ResourceKey.FIELD_LABEL_USER_ID;

export function DashboardPage(): JSX.Element {
    const controller = createDashboardController();
    const [theme, setTheme] = useState<Theme>(controller.getCurrentTheme());

    const handleToggleTheme = (): void => {
        setTheme(controller.onToggleTheme());
    };

    return (
        <PageContainer>
            <Card title={DASHBOARD_TITLE} compact>
                <div class="flex flex-wrap gap-2">
                    <Button
                        variant={ButtonVariant.SECONDARY}
                        label={TOGGLE_THEME_LABEL}
                        iconLeft={theme === Theme.LIGHT ? IconName.STAR : IconName.INFO}
                        onClick={handleToggleTheme}
                    />
                    <Button
                        variant={ButtonVariant.ACCENT}
                        iconLeft={IconName.ADD}
                        onClick={controller.onNavigateSandbox}
                    >
                        Sandbox
                    </Button>
                    <Button
                        variant={ButtonVariant.GHOST}
                        label={LOGIN_ROUTE_LABEL}
                        iconLeft={IconName.CHEVRON_LEFT}
                        onClick={() => navigate(AppRoutePath.LOGIN)}
                    />
                </div>
            </Card>
        </PageContainer>
    );
}

