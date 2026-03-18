export const dynamic = "force-dynamic";

import { notFound, redirect } from "next/navigation";
import { requireRole } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SalonSidebar } from "@/components/dashboard/SalonSidebar";
import { ShiftEditForm } from "@/components/shifts/ShiftEditForm";

export default async function EditShiftPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const session = await requireRole(locale, "SALON");

  const salon = await prisma.salonProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true, name: true, creditsAvailable: true },
  });

  if (!salon) notFound();

  const shift = await prisma.shiftPost.findUnique({
    where: { id },
    select: {
      id: true,
      salonId: true,
      status: true,
      date: true,
      startTime: true,
      address: true,
      city: true,
      postalCode: true,
      numberOfAppointments: true,
      payType: true,
      payRateCents: true,
      requiredExperienceYears: true,
      criteriaTags: true,
      equipmentProvided: true,
      isUrgent: true,
      notes: true,
    },
  });

  if (!shift || shift.salonId !== salon.id) notFound();

  // Cannot edit filled or archived shifts
  if (shift.status === "FILLED" || shift.status === "ARCHIVED") {
    redirect(`/${locale}/dashboard/salon/shifts/${id}`);
  }

  const lang = locale === "fr" ? "fr" : "en";

  return (
    <div className="flex min-h-screen bg-muted/30">
      <SalonSidebar locale={locale} salonName={salon.name} />

      <main className="flex-1 p-6 md:p-8 overflow-auto">
        <div className="max-w-3xl mx-auto">
          <Button variant="ghost" size="sm" asChild className="mb-4 -ml-2">
            <Link href={`/${locale}/dashboard/salon/shifts/${id}`}>
              <ArrowLeft className="h-4 w-4 mr-1" />
              {lang === "fr" ? "Retour" : "Back"}
            </Link>
          </Button>

          <h1 className="text-2xl font-bold mb-6 text-[#1F2933]">
            {lang === "fr" ? "Modifier le remplacement" : "Edit shift"} — {shift.city}
          </h1>

          <ShiftEditForm
            locale={locale}
            shift={{
              id: shift.id,
              date: shift.date.toISOString(),
              startTime: shift.startTime,
              address: shift.address,
              city: shift.city,
              postalCode: shift.postalCode,
              numberOfAppointments: shift.numberOfAppointments,
              payType: shift.payType,
              payRateCents: shift.payRateCents,
              requiredExperienceYears: shift.requiredExperienceYears,
              criteriaTags: shift.criteriaTags,
              equipmentProvided: shift.equipmentProvided,
              isUrgent: shift.isUrgent,
              notes: shift.notes,
            }}
            creditsAvailable={salon.creditsAvailable}
          />
        </div>
      </main>
    </div>
  );
}
