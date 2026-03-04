"use client";

import { useState } from "react";
import { useForm, Controller, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, Coins } from "lucide-react";

const CRITERIA_OPTIONS = [
  { value: "BIG_DOGS",       label: "Grands chiens" },
  { value: "SMALL_DOGS",     label: "Petits chiens" },
  { value: "CATS",           label: "Chats" },
  { value: "RABBITS",        label: "Lapins" },
  { value: "AGGRESSIVE_DOGS", label: "Chiens difficiles" },
  { value: "NORDIC_BREEDS",  label: "Races nordiques" },
];

const REGIONS = [
  "Abitibi-Témiscamingue", "Bas-Saint-Laurent", "Capitale-Nationale",
  "Centre-du-Québec", "Chaudière-Appalaches", "Côte-Nord", "Estrie",
  "Gaspésie–Îles-de-la-Madeleine", "Lanaudière", "Laurentides", "Laval",
  "Mauricie", "Montérégie", "Montréal", "Nord-du-Québec", "Outaouais",
  "Saguenay–Lac-Saint-Jean",
];

const formSchema = z.object({
  date:                    z.string().min(1, "Date requise"),
  startTime:               z.string().regex(/^\d{2}:\d{2}$/, "Format HH:MM requis"),
  address:                 z.string().min(1, "Adresse requise"),
  city:                    z.string().min(1, "Ville requise"),
  region:                  z.string().min(1, "Région requise"),
  postalCode:              z.string().min(1, "Code postal requis"),
  numberOfAppointments:    z.coerce.number().int().min(1).max(30),
  payType:                 z.enum(["HOURLY", "FLAT"]),
  payRate:                 z.coerce.number().min(0.01, "Taux requis"),
  requiredExperienceYears: z.coerce.number().int().min(0).max(30),
  criteriaTags:            z.array(z.string()).default([]),
  equipmentProvided:       z.boolean().default(false),
  isUrgent:                z.boolean().default(false),
  notes:                   z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function ShiftForm({
  locale,
  creditsAvailable,
}: {
  locale: string;
  creditsAvailable: number;
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema) as Resolver<FormValues>,
    defaultValues: {
      payType: "HOURLY",
      numberOfAppointments: 4,
      requiredExperienceYears: 1,
      criteriaTags: [],
      equipmentProvided: false,
      isUrgent: false,
    },
  });

  const payType = form.watch("payType");

  async function onSubmit(values: FormValues) {
    setSubmitting(true);
    try {
      const res = await fetch("/api/shifts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          payRateCents: Math.round(values.payRate * 100),
          criteriaTags: JSON.stringify(values.criteriaTags),
        }),
      });

      if (res.status === 402) {
        toast.error("Crédits insuffisants pour publier ce remplacement.");
        return;
      }
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast.error((err as { message?: string }).message ?? "Une erreur est survenue.");
        return;
      }

      toast.success("Remplacement publié !");
      router.push(`/${locale}/dashboard/salon`);
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  const err = form.formState.errors;

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {/* Credit indicator */}
      <div className={`flex items-center gap-2 rounded-lg border px-4 py-3 text-sm ${creditsAvailable === 0 ? "border-destructive/40 bg-destructive/5 text-destructive" : "border-primary/20 bg-primary/5 text-primary"}`}>
        <Coins className="h-4 w-4 shrink-0" />
        {creditsAvailable === 0
          ? "Aucun crédit disponible. Achetez un forfait pour publier un remplacement."
          : `${creditsAvailable} crédit${creditsAvailable !== 1 ? "s" : ""} disponible${creditsAvailable !== 1 ? "s" : ""}. La publication en consommera 1.`}
      </div>

      {/* Date & time */}
      <Card className="shadow-none">
        <CardHeader className="pb-2 pt-4 px-4 text-sm font-semibold">Date &amp; heure</CardHeader>
        <CardContent className="px-4 pb-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="date">Date du remplacement</Label>
            <Input id="date" type="date" {...form.register("date")} />
            {err.date && <p className="text-xs text-destructive">{err.date.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="startTime">Heure de début</Label>
            <Input id="startTime" type="time" {...form.register("startTime")} />
            {err.startTime && <p className="text-xs text-destructive">{err.startTime.message}</p>}
          </div>
        </CardContent>
      </Card>

      {/* Location */}
      <Card className="shadow-none">
        <CardHeader className="pb-2 pt-4 px-4 text-sm font-semibold">Lieu</CardHeader>
        <CardContent className="px-4 pb-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="address">Adresse</Label>
            <Input id="address" placeholder="123 rue Principale" {...form.register("address")} />
            {err.address && <p className="text-xs text-destructive">{err.address.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="city">Ville</Label>
            <Input id="city" placeholder="Montréal" {...form.register("city")} />
            {err.city && <p className="text-xs text-destructive">{err.city.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label>Région</Label>
            <Controller
              control={form.control}
              name="region"
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value ?? ""}>
                  <SelectTrigger><SelectValue placeholder="Choisir une région" /></SelectTrigger>
                  <SelectContent>
                    {REGIONS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                  </SelectContent>
                </Select>
              )}
            />
            {err.region && <p className="text-xs text-destructive">{err.region.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="postalCode">Code postal</Label>
            <Input id="postalCode" placeholder="H3H 1P3" {...form.register("postalCode")} />
            {err.postalCode && <p className="text-xs text-destructive">{err.postalCode.message}</p>}
          </div>
        </CardContent>
      </Card>

      {/* Pay & workload */}
      <Card className="shadow-none">
        <CardHeader className="pb-2 pt-4 px-4 text-sm font-semibold">Rémunération &amp; charge</CardHeader>
        <CardContent className="px-4 pb-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label>Type de rémunération</Label>
            <Controller
              control={form.control}
              name="payType"
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="HOURLY">À l&apos;heure</SelectItem>
                    <SelectItem value="FLAT">Forfait</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="payRate">
              {payType === "HOURLY" ? "Taux horaire ($)" : "Montant ($)"}
            </Label>
            <Input id="payRate" type="number" step="0.5" min="0" placeholder="25.00" {...form.register("payRate")} />
            {err.payRate && <p className="text-xs text-destructive">{err.payRate.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="numberOfAppointments">Rendez-vous</Label>
            <Input id="numberOfAppointments" type="number" min="1" max="30" {...form.register("numberOfAppointments")} />
            {err.numberOfAppointments && <p className="text-xs text-destructive">{err.numberOfAppointments.message}</p>}
          </div>
        </CardContent>
      </Card>

      {/* Requirements */}
      <Card className="shadow-none">
        <CardHeader className="pb-2 pt-4 px-4 text-sm font-semibold">Exigences</CardHeader>
        <CardContent className="px-4 pb-4 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="requiredExperienceYears">Expérience minimale (années)</Label>
            <Input id="requiredExperienceYears" type="number" min="0" max="30" className="max-w-[120px]" {...form.register("requiredExperienceYears")} />
          </div>
          <div className="space-y-2">
            <Label>Types d&apos;animaux / spécialisations</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <Controller
                control={form.control}
                name="criteriaTags"
                render={({ field }) => (
                  <>
                    {CRITERIA_OPTIONS.map((opt) => (
                      <label key={opt.value} className="flex items-center gap-2 cursor-pointer text-sm select-none">
                        <Checkbox
                          checked={field.value.includes(opt.value)}
                          onCheckedChange={(checked) => {
                            field.onChange(
                              checked
                                ? [...field.value, opt.value]
                                : field.value.filter((v) => v !== opt.value)
                            );
                          }}
                        />
                        {opt.label}
                      </label>
                    ))}
                  </>
                )}
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Controller
              control={form.control}
              name="equipmentProvided"
              render={({ field }) => (
                <Checkbox id="equipmentProvided" checked={field.value} onCheckedChange={field.onChange} />
              )}
            />
            <Label htmlFor="equipmentProvided" className="cursor-pointer">Équipement fourni par le salon</Label>
          </div>
          <div className="flex items-center gap-2">
            <Controller
              control={form.control}
              name="isUrgent"
              render={({ field }) => (
                <Checkbox id="isUrgent" checked={field.value} onCheckedChange={field.onChange} />
              )}
            />
            <Label htmlFor="isUrgent" className="cursor-pointer">
              Marquer comme urgent
              <Badge variant="outline" className="ml-2 text-xs border-amber-400 text-amber-600">Mise en avant à venir</Badge>
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      <Card className="shadow-none">
        <CardHeader className="pb-2 pt-4 px-4 text-sm font-semibold">Notes (optionnel)</CardHeader>
        <CardContent className="px-4 pb-4">
          <textarea
            className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-y"
            placeholder="Informations supplémentaires pour le toiletteur…"
            {...form.register("notes")}
          />
        </CardContent>
      </Card>

      <div className="flex items-center gap-3 pt-2">
        <Button type="submit" disabled={submitting || creditsAvailable === 0} className="min-w-[180px]">
          {submitting ? "Publication…" : "Publier le remplacement"}
        </Button>
        {creditsAvailable === 0 && (
          <p className="flex items-center gap-1 text-xs text-destructive">
            <AlertCircle className="h-3.5 w-3.5" /> Aucun crédit disponible
          </p>
        )}
      </div>
    </form>
  );
}
