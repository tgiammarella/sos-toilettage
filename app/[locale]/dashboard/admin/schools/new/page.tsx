export const dynamic = "force-dynamic";

import { requireRole } from "@/lib/auth-guards";
import Link from "next/link";
import { AdminShell } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { TrainingListingForm } from "@/components/admin/TrainingListingForm";

export default async function AdminNewSchoolPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  await requireRole(locale, "ADMIN");

  return (
    <AdminShell locale={locale}>
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <Button variant="ghost" size="sm" asChild className="mb-4 -ml-2">
            <Link href={`/${locale}/dashboard/admin/schools`}>
              <ArrowLeft className="h-4 w-4 mr-1" />
              {locale === "fr" ? "Retour" : "Back"}
            </Link>
          </Button>
          <h1 className="text-2xl font-bold text-[#1F2933]">
            {locale === "fr" ? "Nouvelle école" : "New school"}
          </h1>
        </div>
        <TrainingListingForm locale={locale} defaultType="SCHOOL" defaultIsTrainer={false} />
      </div>
    </AdminShell>
  );
}
