import type { ComponentChildren, JSX } from "preact";
import { UI } from "@shared/enums/ui.enums";

export interface ButtonProps {
  readonly variant: UI.ButtonVariant;
  readonly children: ComponentChildren;
  readonly disabled?: boolean;
  readonly loading?: boolean;
  readonly type?: JSX.ButtonHTMLAttributes<HTMLButtonElement>["type"];
  readonly class?: string;
  readonly onClick?: JSX.MouseEventHandler<HTMLButtonElement>;
}
