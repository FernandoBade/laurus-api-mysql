import { UI } from "@shared/enums/ui.enums";
import { classNames } from "@/utils/classNames";
import type { ButtonProps } from "./button.types";

const BUTTON_VARIANT_CLASS: Record<UI.ButtonVariant, string> = {
  [UI.ButtonVariant.PRIMARY]: "btn-primary",
  [UI.ButtonVariant.SECONDARY]: "btn-secondary",
  [UI.ButtonVariant.GHOST]: "btn-ghost",
  [UI.ButtonVariant.DANGER]: "btn-error",
};

export function Button({
  variant,
  children,
  disabled = false,
  loading = false,
  type = "button",
  onClick,
  class: className,
}: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      class={classNames("btn", BUTTON_VARIANT_CLASS[variant], className)}
      disabled={disabled || loading}
      aria-busy={loading}
    >
      {loading ? "Loading..." : children}
    </button>
  );
}
