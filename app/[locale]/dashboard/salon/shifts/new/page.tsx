export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShiftForm } from "@/components/shifts/ShiftForm";
import { ArrowLeft } from "lucide-react";
import { SalonSidebar } from "@/components/dashboard/SalonSidebar";

export default async function NewShiftPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await requireRole(locale, "SALON");

  const salon = await prisma.salonProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true, name: true, creditsAvailable: true },
  });

  if (!salon) notFound();

  return (
    <div className="flex min-h-screen bg-muted/30">
      <SalonSidebar locale={locale} salonName={salon.name} />

      <main className="flex-1 p-6 md:p-8 pb-24 md:pb-8 overflow-auto">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6">
            <Button variant="ghost" size="sm" asChild className="mb-4 -ml-2">
              <Link href={`/${locale}/dashboard/salon/shifts`}>
                <ArrowLeft className="h-4 w-4 mr-1" /> Retour
              </Link>
            </Button>
            <h1 className="text-2xl font-bold text-[#1F2933]">Publier un remplacement</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Remplissez les informations ci-dessous. La publication consommera 1 crédit.
            </p>
          </div>

          <ShiftForm locale={locale} creditsAvailable={salon.creditsAvailable} />
        </div>
      </main>
    </div>
  );
}
