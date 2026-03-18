import { Suspense } from "react";
import { getPublicOpenSlots } from "@/lib/open-slots";
import { SlotCard, type SlotCardData } from "@/components/open-slots/SlotCard";
import { SlotFilters } from "@/components/open-slots/SlotFilters";
import { Navbar } from "@/components/nav/Navbar";
import { Calendar } from "lucide-react";
import type { OpenSlotService, DogSize } from "@prisma/client";

export default async function DisponibilitesPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { locale } = await params;
  const sp = await searchParams;
  const isFr = locale !== "en";

  const slots = await getPublicOpenSlots({
    serviceType: (sp.serviceType as OpenSlotService) || undefined,
    dogSize: (sp.dogSize as DogSize) || undefined,
    date: sp.date || undefined,
  });

  const cards: SlotCardData[] = slots.map((s) => ({
    id: s.id,
    date: s.date.toISOString(),
    durationMin: s.durationMin,
    serviceType: s.serviceType,
    dogSize: s.dogSize,
    price: s.price,
    notes: s.notes,
    salon: {
      id: s.salon.id,
      name: s.salon.name,
      city: s.salon.city,
      region: s.salon.region,
      phone: s.salon.phone,
      website: s.salon.website,
      user: { email: s.salon.user.email },
    },
  }));

  return (
    <>
      <Navbar />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Calendar className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#1F2933]">
              {isFr ? "Créneaux disponibles" : "Available Slots"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {isFr
                ? "Trouvez un rendez-vous de toilettage disponible près de chez vous."
                : "Find an available grooming appointment near you."}
            </p>
          </div>
        </div>

        <Suspense>
          <SlotFilters locale={locale} />
        </Suspense>

        {cards.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <Calendar className="h-10 w-10 mx-auto mb-3 opacity-40" />
            <p>
              {isFr
                ? "Aucun créneau disponible en ce moment — revenez bientôt."
                : "No slots available at the moment — check back soon."}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {cards.map((slot) => (
              <SlotCard key={slot.id} slot={slot} locale={locale} />
            ))}
          </div>
        )}
      </main>
    </>
  );
}
