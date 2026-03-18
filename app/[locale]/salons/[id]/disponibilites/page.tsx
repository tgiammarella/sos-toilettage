import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSalonPublicOpenSlots } from "@/lib/open-slots";
import { SlotCard, type SlotCardData } from "@/components/open-slots/SlotCard";
import { Navbar } from "@/components/nav/Navbar";
import { Calendar, Globe, Phone } from "lucide-react";

export default async function SalonDisponibilitesPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const isFr = locale !== "en";

  const salon = await prisma.salonProfile.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      city: true,
      region: true,
      phone: true,
      website: true,
      user: { select: { email: true } },
    },
  });

  if (!salon) notFound();

  const slots = await getSalonPublicOpenSlots(id);

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
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Salon header */}
        <div className="mb-8 pb-6 border-b">
          <h1 className="text-2xl font-bold text-[#1F2933]">{salon.name}</h1>
          <p className="text-muted-foreground">{salon.city}, {salon.region}</p>
          <div className="flex flex-wrap items-center gap-4 mt-2 text-sm">
            {salon.phone && (
              <a href={`tel:${salon.phone}`} className="flex items-center gap-1 text-primary hover:underline">
                <Phone className="h-3.5 w-3.5" /> {salon.phone}
              </a>
            )}
            {salon.website && (
              <a href={salon.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary hover:underline">
                <Globe className="h-3.5 w-3.5" /> {isFr ? "Site web" : "Website"}
              </a>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 mb-6">
          <Calendar className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">
            {isFr ? "Créneaux disponibles" : "Available Slots"}
          </h2>
        </div>

        {cards.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <Calendar className="h-10 w-10 mx-auto mb-3 opacity-40" />
            <p>
              {isFr
                ? "Aucun créneau disponible en ce moment."
                : "No slots available at the moment."}
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {cards.map((slot) => (
              <SlotCard key={slot.id} slot={slot} locale={locale} />
            ))}
          </div>
        )}
      </main>
    </>
  );
}
