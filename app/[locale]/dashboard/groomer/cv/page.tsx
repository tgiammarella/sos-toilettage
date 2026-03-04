export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth-guards";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, FileUp } from "lucide-react";
import { GroomerSidebar } from "@/components/dashboard/GroomerSidebar";
import { CvUploadButton } from "@/components/groomer/CvUploadButton";

export default async function GroomerCvPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await requireRole(locale, "GROOMER");

  const t = await getTranslations("dashboard.groomer");
  const tDashboard = await getTranslations("dashboard");

  const groomer = await prisma.groomerProfile.findUnique({
    where: { userId: session.user.id },
    select: { fullName: true, cvFileUrl: true },
  });

  if (!groomer) notFound();

  const lang = locale === "en" ? "en" : "fr";

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
            <h1 className="text-2xl font-bold">
              {tDashboard("welcome")}, {groomer.fullName} 👋
            </h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              {t("upload_cv")}
            </p>
          </div>

          <Separator />

          {/* PDF file upload */}
          <Card className="border shadow-none">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <FileUp className="h-4 w-4" />
                {lang === "fr" ? "Téléverser un PDF" : "Upload a PDF"}
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
