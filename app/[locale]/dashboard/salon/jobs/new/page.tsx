export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth-guards";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Briefcase } from "lucide-react";
import { SalonSidebar } from "@/components/dashboard/SalonSidebar";
import { JobForm } from "@/components/jobs/JobForm";

export default async function NewJobPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await requireRole(locale, "SALON");

  const tDashboard = await getTranslations("dashboard.salon");

  const salon = await prisma.salonProfile.findUnique({
    where: { userId: session.user.id },
    select: { name: true },
  });

  if (!salon) notFound();

  return (
    <div className="flex min-h-screen bg-muted/30">
      <SalonSidebar locale={locale} salonName={salon.name} />

      <main className="flex-1 p-6 md:p-8 overflow-auto">
        <div className="max-w-3xl mx-auto space-y-6">
          <div>
            <Button variant="ghost" size="sm" asChild className="mb-4 -ml-2">
              <Link href={`/${locale}/dashboard/salon/jobs`}>
                <ArrowLeft className="h-4 w-4 mr-1" /> Retour à mes offres
              </Link>
            </Button>
            <h1 className="text-2xl font-bold flex items-center gap-2 text-[#1F2933]">
              <Briefcase className="h-5 w-5" />
              {tDashboard("new_job")}
            </h1>
          </div>

          <JobForm locale={locale} />
        </div>
      </main>
    </div>
  );
}
