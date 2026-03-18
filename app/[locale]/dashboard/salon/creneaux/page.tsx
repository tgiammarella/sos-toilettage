import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getSalonOpenSlots } from "@/lib/open-slots";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CreateSlotForm } from "@/components/open-slots/CreateSlotForm";
import { SlotActions } from "@/components/open-slots/SlotActions";
import { Calendar, Lock, ExternalLink, Clock, DollarSign } from "lucide-react";
import {
  getLang,
  getLabel,
  OPEN_SLOT_SERVICE_LABEL,
  DOG_SIZE_LABEL,
  OPEN_SLOT_STATUS_LABEL,
  OPEN_SLOT_STATUS_BADGE_CLASS,
} from "@/lib/labels";

export default async function SalonCreneauxPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const lang = getLang(locale);
  const isFr = lang === "fr";

  const session = await auth();
  if (!session || session.user.role !== "SALON") {
    redirect(`/${locale}/auth/login`);
  }

  const salon = await prisma.salonProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true, subscriptionPlan: true },
  });

  if (!salon) redirect(`/${locale}/auth/login`);

  // Locked state for non-subscribers
  if (salon.subscriptionPlan === "NONE") {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <Calendar className="h-5 w-5 text-primary" />
          <h1 className="text-xl font-bold text-[#1F2933]">
            {isFr ? "Créneaux disponibles" : "Available Slots"}
          </h1>
        </div>

        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <Lock className="h-10 w-10 mx-auto mb-4 text-muted-foreground/50" />
            <h2 className="text-lg font-semibold mb-2">
              {isFr ? "Fonctionnalité réservée aux abonnés" : "Subscriber-only feature"}
            </h2>
            <p className="text-muted-foreground text-sm max-w-md mx-auto mb-6">
              {isFr
                ? "Passez à un abonnement mensuel pour publier vos créneaux disponibles et attirer de nouveaux clients."
                : "Upgrade to a monthly subscription to publish available slots and attract new clients."}
            </p>
            <Button asChild>
              <Link href={`/${locale}/dashboard/salon/billing`}>
                {isFr ? "Voir les abonnements" : "View subscriptions"}
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Auto-expire stale active slots
  const now = new Date();
  await prisma.openSlot.updateMany({
    where: { salonId: salon.id, status: "ACTIVE", expiresAt: { lt: now } },
    data: { status: "EXPIRED" },
  });

  const slots = await getSalonOpenSlots(salon.id);

  const shareUrl = `/${locale}/salons/${salon.id}/disponibilites`;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          <h1 className="text-xl font-bold text-[#1F2933]">
            {isFr ? "Créneaux disponibles" : "Available Slots"}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={shareUrl} target="_blank">
              <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
              {isFr ? "Page publique" : "Public page"}
            </Link>
          </Button>
          <CreateSlotForm locale={locale} />
        </div>
      </div>

      {slots.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center text-muted-foreground">
            <Calendar className="h-8 w-8 mx-auto mb-3 opacity-40" />
            <p>
              {isFr
                ? "Aucun créneau publié. Cliquez sur « Publier un créneau » pour commencer."
                : "No slots published. Click \"Post a slot\" to get started."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {slots.map((slot) => {
            const isActive = slot.status === "ACTIVE";
            return (
              <Card key={slot.id} className={isActive ? "" : "opacity-70"}>
                <CardContent className="py-4 px-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge
                          variant="outline"
                          className={OPEN_SLOT_STATUS_BADGE_CLASS[slot.status] ?? ""}
                        >
                          {getLabel(OPEN_SLOT_STATUS_LABEL, slot.status, lang)}
                        </Badge>
                        <Badge variant="secondary">
                          {getLabel(OPEN_SLOT_SERVICE_LABEL, slot.serviceType, lang)}
                        </Badge>
                        {slot.dogSize && (
                          <Badge variant="outline" className="text-xs">
                            {getLabel(DOG_SIZE_LABEL, slot.dogSize, lang)}
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {slot.date.toLocaleDateString("fr-CA", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                          })}
                          {" "}
                          {slot.date.toLocaleTimeString("fr-CA", {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: false,
                          }).replace(":", "h")}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {slot.durationMin} min
                        </span>
                        {slot.price != null && (
                          <span className="flex items-center gap-1">
                            <DollarSign className="h-3.5 w-3.5" />
                            {slot.price.toFixed(2)} $
                          </span>
                        )}
                      </div>

                      {slot.notes && (
                        <p className="text-xs text-muted-foreground italic">{slot.notes}</p>
                      )}
                    </div>

                    {isActive && (
                      <SlotActions slotId={slot.id} locale={locale} />
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
