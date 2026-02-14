import type { JSX } from "preact";
import { useMemo, useState } from "preact/hooks";
import { ResourceKey } from "@shared/i18n/resource.keys";
import { AlertVariant, ButtonVariant } from "@shared/enums/ui.enums";
import { IconName } from "@shared/enums/icon.enums";
import { InputType } from "@shared/enums/input.enums";
import { Alert } from "@/components/alert/alert";
import { Button } from "@/components/button/button";
import { Card } from "@/components/card/card";
import { Form } from "@/components/form/form";
import { Input } from "@/components/input/input";
import { PageContainer } from "@/components/page-container/page-container";
import { createLoginController } from "@/pages/login/login.controller";

const LOGIN_CARD_TITLE = ResourceKey.FIELD_LABEL_USER_ID;
const LOGIN_EMAIL_LABEL = ResourceKey.FIELD_LABEL_EMAIL;
const LOGIN_PASSWORD_LABEL = ResourceKey.FIELD_LABEL_PASSWORD;
const LOGIN_SUBMIT_LABEL = ResourceKey.FIELD_LABEL_PROFILE;

export function LoginPage(): JSX.Element {
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [error, setError] = useState<ResourceKey | null>(null);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    const controller = useMemo(() => createLoginController({ setError }), []);

    const handleSubmit = async (): Promise<void> => {
        setIsSubmitting(true);
        await controller.onSubmit(email, password);
        setIsSubmitting(false);
    };

    return (
        <PageContainer>
            <Card title={LOGIN_CARD_TITLE} compact>
                <Form onSubmit={handleSubmit} disabled={isSubmitting}>
                    <Input
                        label={LOGIN_EMAIL_LABEL}
                        type={InputType.EMAIL}
                        value={email}
                        autoComplete="email"
                        required
                        icon={IconName.EMAIL}
                        onChange={setEmail}
                    />

                    <Input
                        label={LOGIN_PASSWORD_LABEL}
                        type={InputType.PASSWORD}
                        value={password}
                        autoComplete="current-password"
                        required
                        icon={IconName.LOCK}
                        onChange={setPassword}
                    />

                    {error ? <Alert variant={AlertVariant.ERROR} message={error} /> : null}

                    <Button
                        type="submit"
                        variant={ButtonVariant.PRIMARY}
                        label={LOGIN_SUBMIT_LABEL}
                        iconLeft={IconName.CHECK}
                        loading={isSubmitting}
                    />
                </Form>
            </Card>
        </PageContainer>
    );
}

