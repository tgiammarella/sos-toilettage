"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { getLabel, getLang, OPEN_SLOT_SERVICE_LABEL, DOG_SIZE_LABEL } from "@/lib/labels";

const SERVICE_KEYS = ["BAIN_COUPE", "BAIN_SEULEMENT", "COUPE_SEULEMENT", "TOILETTAGE_COMPLET", "AUTRE"];
const SIZE_KEYS = ["TRES_PETIT", "PETIT", "MOYEN", "GRAND", "TRES_GRAND"];
const DURATION_OPTIONS = [30, 45, 60, 90, 120];

export function CreateSlotForm({ locale }: { locale: string }) {
  const lang = getLang(locale);
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [durationMin, setDurationMin] = useState("60");
  const [serviceType, setServiceType] = useState("");
  const [dogSize, setDogSize] = useState("");
  const [price, setPrice] = useState("");
  const [notes, setNotes] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!date || !time || !serviceType) return;

    setLoading(true);
    try {
      const res = await fetch("/api/open-slots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date,
          time,
          durationMin: parseInt(durationMin),
          serviceType,
          dogSize: dogSize || undefined,
          price: price ? parseFloat(price) : undefined,
          notes: notes || undefined,
        }),
      });

      if (res.ok) {
        toast.success(lang === "fr" ? "Créneau publié !" : "Slot published!");
        setOpen(false);
        resetForm();
        router.refresh();
      } else {
        const data = await res.json();
        if (data.error === "SUBSCRIPTION_REQUIRED") {
          toast.error(lang === "fr" ? "Abonnement requis." : "Subscription required.");
        } else {
          toast.error(lang === "fr" ? "Erreur lors de la publication." : "Error publishing slot.");
        }
      }
    } catch {
      toast.error(lang === "fr" ? "Erreur réseau." : "Network error.");
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setDate("");
    setTime("");
    setDurationMin("60");
    setServiceType("");
    setDogSize("");
    setPrice("");
    setNotes("");
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-1.5" />
          {lang === "fr" ? "Publier un créneau" : "Post a slot"}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {lang === "fr" ? "Nouveau créneau disponible" : "New available slot"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>{lang === "fr" ? "Date" : "Date"}</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
            </div>
            <div className="space-y-1">
              <Label>{lang === "fr" ? "Heure" : "Time"}</Label>
              <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} required />
            </div>
          </div>

          <div className="space-y-1">
            <Label>{lang === "fr" ? "Durée" : "Duration"}</Label>
            <Select value={durationMin} onValueChange={setDurationMin}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DURATION_OPTIONS.map((d) => (
                  <SelectItem key={d} value={String(d)}>
                    {d} min
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label>{lang === "fr" ? "Type de service" : "Service type"}</Label>
            <Select value={serviceType} onValueChange={setServiceType} required>
              <SelectTrigger>
                <SelectValue placeholder={lang === "fr" ? "Choisir…" : "Choose…"} />
              </SelectTrigger>
              <SelectContent>
                {SERVICE_KEYS.map((k) => (
                  <SelectItem key={k} value={k}>
                    {getLabel(OPEN_SLOT_SERVICE_LABEL, k, lang)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label>{lang === "fr" ? "Taille du chien (optionnel)" : "Dog size (optional)"}</Label>
            <Select value={dogSize} onValueChange={setDogSize}>
              <SelectTrigger>
                <SelectValue placeholder={lang === "fr" ? "Toutes tailles" : "Any size"} />
              </SelectTrigger>
              <SelectContent>
                {SIZE_KEYS.map((k) => (
                  <SelectItem key={k} value={k}>
                    {getLabel(DOG_SIZE_LABEL, k, lang)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label>{lang === "fr" ? "Prix (optionnel)" : "Price (optional)"}</Label>
            <Input
              type="number"
              step="0.01"
              min="0"
              placeholder="$"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <Label>{lang === "fr" ? "Notes (optionnel)" : "Notes (optional)"}</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              maxLength={500}
              rows={2}
              placeholder={lang === "fr" ? "Ex: Race spécifique, demandes particulières…" : "E.g. specific breed, special requests…"}
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading || !serviceType || !date || !time}>
            {loading
              ? (lang === "fr" ? "Publication…" : "Publishing…")
              : (lang === "fr" ? "Publier le créneau" : "Publish slot")}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
