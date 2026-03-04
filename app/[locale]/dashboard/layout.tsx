import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const session = await auth();
  const { locale } = await params;

  if (!session) {
    redirect(`/${locale}/auth/login`);
  }

  // Role-based auto-redirect: ensure user lands on their correct dashboard
  // (handled by each role-specific page, nothing extra needed here)

  return <>{children}</>;
}
