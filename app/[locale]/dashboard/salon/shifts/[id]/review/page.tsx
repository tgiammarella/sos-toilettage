export const dynamic = "force-dynamic";

import { notFound, redirect } from "next/navigation";
import { requireRole } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SalonSidebar } from "@/components/dashboard/SalonSidebar";
import { ShiftReviewForm } from "@/components/reviews/ShiftReviewForm";

export default async function ShiftReviewPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const session = await requireRole(locale, "SALON");

  const salon = await prisma.salonProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true, name: true },
  });

  if (!salon) notFound();

  const shift = await prisma.shiftPost.findUnique({
    where: { id },
    select: {
      id: true,
      salonId: true,
      status: true,
      city: true,
      date: true,
      engagement: {
        select: {
          id: true,
          groomerId: true,
          groomer: { select: { fullName: true } },
          reviews: {
            where: { reviewerUserId: session.user.id },
            select: { id: true },
          },
        },
      },
    },
  });

  if (!shift || shift.salonId !== salon.id) notFound();

  // Must be COMPLETED to review
  if (shift.status !== "COMPLETED") {
    redirect(`/${locale}/dashboard/salon/shifts/${id}`);
  }

  if (!shift.engagement) notFound();

  // Already reviewed — redirect back
  if (shift.engagement.reviews.length > 0) {
    redirect(`/${locale}/dashboard/salon/shifts/${id}`);
  }

  const lang = locale === "fr" ? "fr" : "en";

  return (
    <div className="flex min-h-screen bg-muted/30">
      <SalonSidebar locale={locale} salonName={salon.name} />

      <main className="flex-1 p-6 md:p-8 overflow-auto">
        <div className="max-w-xl mx-auto space-y-6">
          <Button variant="ghost" size="sm" asChild className="-ml-2">
            <Link href={`/${locale}/dashboard/salon/shifts/${id}`}>
              <ArrowLeft className="h-4 w-4 mr-1" />
              {lang === "fr" ? "Retour" : "Back"}
            </Link>
          </Button>

          <div>
            <h1 className="text-2xl font-bold text-[#1F2933]">
              {lang === "fr" ? "Laisser un avis" : "Leave a Review"}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {lang === "fr"
                ? `Évaluez ${shift.engagement.groomer.fullName} pour le remplacement du ${new Date(shift.date).toLocaleDateString("fr-CA", { day: "numeric", month: "long", year: "numeric" })} à ${shift.city}.`
                : `Rate ${shift.engagement.groomer.fullName} for the shift on ${new Date(shift.date).toLocaleDateString("en-CA", { day: "numeric", month: "long", year: "numeric" })} in ${shift.city}.`}
            </p>
          </div>

          <ShiftReviewForm
            engagementId={shift.engagement.id}
            groomerName={shift.engagement.groomer.fullName}
            shiftId={id}
            locale={locale}
          />
        </div>
      </main>
    </div>
  );
}
