export const dynamic = "force-dynamic";

import { requireRole } from "@/lib/auth-guards";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, UserCog, FileUp } from "lucide-react";
import { GroomerSidebar } from "@/components/dashboard/GroomerSidebar";
import { GroomerProfileForm } from "@/components/groomer/GroomerProfileForm";
import { CvUploadButton } from "@/components/groomer/CvUploadButton";

export default async function GroomerProfileEditPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await requireRole(locale, "GROOMER");

  const tDashboard = await getTranslations("dashboard");
  const t = await getTranslations("dashboard.groomer");

  const groomer = await prisma.groomerProfile.findUnique({
    where: { userId: session.user.id },
    select: {
      fullName: true,
      city: true,
      yearsExperience: true,
      bio: true,
      specializations: true,
      cvFileUrl: true,
    },
  });

  if (!groomer) notFound();

  const lang = locale === "en" ? "en" : "fr";

  let initialSpecs: string[] = [];
  try {
    initialSpecs = JSON.parse(groomer.specializations ?? "[]");
  } catch {}

  return (
    <div className="flex min-h-screen bg-muted/40">
      <GroomerSidebar locale={locale} groomerName={groomer.fullName} />

      <main className="flex-1 p-6 md:p-8 overflow-auto">
        <div className="max-w-3xl mx-auto space-y-6">
          <div>
            <Button variant="ghost" size="sm" asChild className="mb-3 -ml-2">
              <Link href={`/${locale}/dashboard/groomer`}>
                <ArrowLeft className="h-4 w-4 mr-1" />
                {lang === "fr" ? "Retour au tableau de bord" : "Back to dashboard"}
              </Link>
            </Button>
            <h1 className="text-2xl font-bold text-[#1F2933]">
              {tDashboard("welcome")}, {groomer.fullName} 👋
            </h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              {t("edit_profile")}
            </p>
          </div>

          <Separator />

          <Card className="border shadow-none">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <UserCog className="h-4 w-4" />
                {lang === "fr" ? "Informations du profil" : "Profile information"}
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-6">
              <GroomerProfileForm
                lang={lang}
                initial={{
                  fullName: groomer.fullName,
                  city: groomer.city,
                  yearsExperience: groomer.yearsExperience,
                  bio: groomer.bio ?? "",
                  specializations: initialSpecs,
                }}
              />
            </CardContent>
          </Card>

          <Card className="border shadow-none">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <FileUp className="h-4 w-4" />
                {lang === "fr" ? "Téléverser un CV (PDF)" : "Upload CV (PDF)"}
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-6">
              <CvUploadButton lang={lang} currentUrl={groomer.cvFileUrl} />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
