export const dynamic = "force-dynamic";

import { requireRole } from "@/lib/auth-guards";
import { AdminShell } from "@/components/admin/AdminShell";
import { PartnersAdmin } from "@/components/admin/PartnersAdmin";

export default async function AdminPartnersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  await requireRole(locale, "ADMIN");

  return (
    <AdminShell locale={locale}>
      <PartnersAdmin locale={locale} />
    </AdminShell>
  );
}
