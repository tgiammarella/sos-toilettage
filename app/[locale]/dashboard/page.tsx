import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function DashboardIndexPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth();

  if (!session) {
    redirect(`/${locale}/auth/login`);
  }

  const base = `/${locale}/dashboard`;
  const role = session.user.role;

  if (role === "SALON") {
    redirect(`${base}/salon`);
  }
  if (role === "GROOMER") {
    redirect(`${base}/groomer`);
  }
  if (role === "ADMIN") {
    redirect(`${base}/admin`);
  }

  // Fallback: send to home if role is unknown
  redirect(`/${locale}`);
}

