import type { ComponentChildren } from "preact";

interface PageContainerProps {
  readonly children: ComponentChildren;
}

export function PageContainer({ children }: PageContainerProps) {
  return <section class="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 lg:px-8">{children}</section>;
}
