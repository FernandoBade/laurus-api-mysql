import { redirect } from "next/navigation";

type LoginRedirectProps = {
  searchParams?:
    | Record<string, string | string[] | undefined>
    | Promise<Record<string, string | string[] | undefined>>;
};

export default async function LoginRedirect({
  searchParams,
}: LoginRedirectProps) {
  const resolvedSearchParams = searchParams
    ? await Promise.resolve(searchParams)
    : undefined;
  const params = new URLSearchParams();
  if (resolvedSearchParams) {
    Object.entries(resolvedSearchParams).forEach(([key, value]) => {
      if (typeof value === "string") {
        params.set(key, value);
      } else if (Array.isArray(value) && value[0]) {
        params.set(key, value[0]);
      }
    });
  }
  const query = params.toString();
  redirect(query ? `/app/login?${query}` : "/app/login");
}
