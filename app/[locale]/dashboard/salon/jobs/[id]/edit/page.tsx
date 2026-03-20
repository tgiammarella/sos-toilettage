export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Pencil } from "lucide-react";
import { SalonSidebar } from "@/components/dashboard/SalonSidebar";
import { JobEditForm } from "@/components/jobs/JobEditForm";

export default async function EditJobPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const session = await requireRole(locale, "SALON");
  const lang = locale === "en" ? "en" : "fr";

  const salon = await prisma.salonProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true, name: true },
  });

  if (!salon) notFound();

  const job = await prisma.jobPost.findUnique({
    where: { id },
    select: {
      salonId:        true,
      title:          true,
      employmentType: true,
      city:           true,
      region:         true,
      description:    true,
      payInfo:        true,
      requirements:   true,
    },
  });

  if (!job || job.salonId !== salon.id) notFound();

  return (
    <div className="flex min-h-screen bg-muted/30">
      <SalonSidebar locale={locale} salonName={salon.name} />

      <main className="flex-1 p-6 md:p-8 pb-24 md:pb-8 overflow-auto">
        <div className="max-w-3xl mx-auto space-y-6">
          <div>
            <Button variant="ghost" size="sm" asChild className="mb-4 -ml-2">
              <Link href={`/${locale}/dashboard/salon/jobs/${id}`}>
                <ArrowLeft className="h-4 w-4 mr-1" />
                {lang === "fr" ? "Retour à l'offre" : "Back to job"}
              </Link>
            </Button>
            <h1 className="text-2xl font-bold flex items-center gap-2 text-[#1F2933]">
              <Pencil className="h-5 w-5" />
              {lang === "fr" ? "Modifier l'offre d'emploi" : "Edit job offer"}
            </h1>
            <p className="text-muted-foreground text-sm mt-0.5">{job.title}</p>
          </div>

          <JobEditForm
            jobId={id}
            locale={locale}
            initial={{
              title:          job.title,
              employmentType: job.employmentType,
              city:           job.city,
              region:         job.region,
              description:    job.description,
              payInfo:        job.payInfo ?? undefined,
              requirements:   job.requirements ?? undefined,
            }}
          />
        </div>
      </main>
    </div>
  );
}
