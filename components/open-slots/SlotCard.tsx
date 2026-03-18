import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Phone, Mail, Clock, Calendar, DollarSign, Dog } from "lucide-react";
import { getLabel, getLang, OPEN_SLOT_SERVICE_LABEL, DOG_SIZE_LABEL, type Lang } from "@/lib/labels";

interface SlotSalon {
  id: string;
  name: string;
  city: string;
  region: string;
  phone: string | null;
  website: string | null;
  user: { email: string };
}

export interface SlotCardData {
  id: string;
  date: string;
  durationMin: number;
  serviceType: string;
  dogSize: string | null;
  price: number | null;
  notes: string | null;
  salon: SlotSalon;
}

function formatDateFr(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("fr-CA", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatTimeFr(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleTimeString("fr-CA", { hour: "2-digit", minute: "2-digit", hour12: false }).replace(":", "h");
}

export function SlotCard({ slot, locale }: { slot: SlotCardData; locale: string }) {
  const lang = getLang(locale);
  const contactPhone = slot.salon.phone;
  const contactEmail = slot.salon.user.email;

  return (
    <Card className="border shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-5 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-semibold text-base">{slot.salon.name}</p>
            <p className="text-sm text-muted-foreground">{slot.salon.city}, {slot.salon.region}</p>
          </div>
          <Badge variant="secondary" className="shrink-0">
            {getLabel(OPEN_SLOT_SERVICE_LABEL, slot.serviceType, lang)}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Calendar className="h-3.5 w-3.5 shrink-0" />
            <span>{formatDateFr(slot.date)}</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Clock className="h-3.5 w-3.5 shrink-0" />
            <span>{formatTimeFr(slot.date)} · {slot.durationMin} min</span>
          </div>
          {slot.dogSize && (
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Dog className="h-3.5 w-3.5 shrink-0" />
              <span>{getLabel(DOG_SIZE_LABEL, slot.dogSize, lang)}</span>
            </div>
          )}
          {slot.price != null && (
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <DollarSign className="h-3.5 w-3.5 shrink-0" />
              <span>{slot.price.toFixed(2)} $</span>
            </div>
          )}
        </div>

        {slot.notes && (
          <p className="text-sm text-muted-foreground italic">{slot.notes}</p>
        )}

        <div className="flex items-center gap-2 pt-1">
          {contactPhone && (
            <Button size="sm" variant="default" asChild>
              <a href={`tel:${contactPhone}`}>
                <Phone className="h-3.5 w-3.5 mr-1.5" />
                {lang === "fr" ? "Appeler" : "Call"}
              </a>
            </Button>
          )}
          <Button size="sm" variant="outline" asChild>
            <a href={`mailto:${contactEmail}`}>
              <Mail className="h-3.5 w-3.5 mr-1.5" />
              {lang === "fr" ? "Courriel" : "Email"}
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
