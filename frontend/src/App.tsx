import "@/styles/global.css";
import { useEffect, useState } from "preact/hooks";
import { AppRouter } from "@/routes/router";
import { subscribeLocale } from "@/state/locale.store";

/**
 * @summary Renders the root application component.
 */
export function App() {
  const [, setLocaleVersion] = useState<number>(0);

  useEffect(() => {
    return subscribeLocale(() => {
      setLocaleVersion((current) => current + 1);
    });
  }, []);

  return <AppRouter />;
}
