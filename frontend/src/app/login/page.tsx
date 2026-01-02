import { redirect } from "next/navigation";

export default function LoginRedirect() {
  redirect("/app/login");
}
