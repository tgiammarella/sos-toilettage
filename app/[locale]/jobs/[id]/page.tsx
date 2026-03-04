export const dynamic = "force-dynamic";

import { auth } from "@/auth";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/nav/Navbar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { JobApplyButton } from "@/components/jobs/JobApplyButton";
import {
  MapPin,
  Briefcase,
  ArrowLeft,
  CalendarDays,
  Banknote,
  ClipboardList,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const EMPLOYMENT_LABELS: Record<string, Record<string, string>> = {
  FULL_TIME: { fr: "Temps plein",    en: "Full-time" },
  PART_TIME: { fr: "Temps partiel",  en: "Part-time" },
  CONTRACT:  { fr: "Contrat",        en: "Contract" },
};

export default async function PublicJobDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const session = await auth();

  const job = await prisma.jobPost.findUnique({
    where: { id },
    include: {
      salon: { select: { name: true } },
    },
  });

  if (!job || (job.status !== "PUBLISHED" && job.status !== "FILLED")) {
    notFound();
  }

  const isFilled = job.status === "FILLED";

  // Check if the logged-in groomer already applied
  let alreadyApplied = false;
  if (session?.user.role === "GROOMER") {
    const groomer = await prisma.groomerProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });
    if (groomer) {
      const existing = await prisma.application.findFirst({
        where: { jobPostId: id, groomerId: groomer.id },
        select: { id: true },
      });
      alreadyApplied = !!existing;
    }
  }

  const employmentLabel =
    EMPLOYMENT_LABELS[job.employmentType]?.[locale] ?? job.employmentType;

  const postedDate = job.publishedAt
    ? new Date(job.publishedAt).toLocaleDateString(
        locale === "fr" ? "fr-CA" : "en-CA",
        { year: "numeric", month: "long", day: "numeric" }
      )
    : new Date(job.createdAt).toLocaleDateString(
        locale === "fr" ? "fr-CA" : "en-CA",
        { year: "numeric", month: "long", day: "numeric" }
      );

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-10 max-w-2xl">
          <Button variant="ghost" size="sm" asChild className="mb-5 -ml-2">
            <Link href={`/${locale}/jobs`}>
              <ArrowLeft className="h-4 w-4 mr-1" /> Retour aux offres
            </Link>
          </Button>

          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <Badge variant="secondary" className="text-xs">{employmentLabel}</Badge>
              {isFilled && (
                <Badge variant="outline" className="text-xs text-muted-foreground">
                  Poste comblé
                </Badge>
              )}
            </div>
            <h1 className="text-2xl font-bold leading-snug">{job.title}</h1>
            <p className="text-base font-medium text-muted-foreground mt-1">
              {job.salon.name}
            </p>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              {job.city}, {job.region}
            </div>
          </div>

          {/* Details card */}
          <Card className="border border-border/80 shadow-sm mb-6 bg-card/95">
            <CardContent className="py-5 px-6 space-y-4">
              <div>
                <p className="text-xs font-semibold uppercase text-muted-foreground mb-1">
                  Type de poste
                </p>
                <div className="flex items-center gap-2 text-sm">
                  <Briefcase className="h-4 w-4 text-muted-foreground shrink-0" />
                  {employmentLabel}
                </div>
              </div>

              {job.payInfo && (
                <div>
                  <p className="text-xs font-semibold uppercase text-muted-foreground mb-1">
                    Rémunération
                  </p>
                  <div className="flex items-center gap-2 text-sm">
                    <Banknote className="h-4 w-4 text-muted-foreground shrink-0" />
                    {job.payInfo}
                  </div>
                </div>
              )}

              <div>
                <p className="text-xs font-semibold uppercase text-muted-foreground mb-1">
                  Publié le
                </p>
                <div className="flex items-center gap-2 text-sm">
                  <CalendarDays className="h-4 w-4 text-muted-foreground shrink-0" />
                  {postedDate}
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">
                  Description du poste
                </p>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {job.description}
                </p>
              </div>

              {job.requirements && (
                <div>
                  <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">
                    <ClipboardList className="inline h-3.5 w-3.5 mr-1 align-text-top" />
                    Exigences
                  </p>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {job.requirements}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Apply section */}
          <JobApplyButton
            jobId={id}
            locale={locale}
            userRole={session?.user.role ?? null}
            alreadyApplied={alreadyApplied}
            isFilled={isFilled}
          />
        </div>
      </main>
    </div>
  );
}
