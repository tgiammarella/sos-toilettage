import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function LoginRedirectPage() {
  const locale = (await cookies()).get("NEXT_LOCALE")?.value ?? "fr";
  redirect(`/${locale}/auth/login`);
}
