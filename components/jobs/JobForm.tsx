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
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const REGIONS = [
  "Abitibi-Témiscamingue", "Bas-Saint-Laurent", "Capitale-Nationale",
  "Centre-du-Québec", "Chaudière-Appalaches", "Côte-Nord", "Estrie",
  "Gaspésie–Îles-de-la-Madeleine", "Lanaudière", "Laurentides", "Laval",
  "Mauricie", "Montérégie", "Montréal", "Nord-du-Québec", "Outaouais",
  "Saguenay–Lac-Saint-Jean",
];

const formSchema = z.object({
  title:          z.string().min(1, "Titre requis"),
  employmentType: z.enum(["FULL_TIME", "PART_TIME", "CONTRACT"]),
  city:           z.string().min(1, "Ville requise"),
  region:         z.string().min(1, "Région requise"),
  description:    z.string().min(1, "Description requise"),
  payInfo:        z.string().optional(),
  requirements:   z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function JobForm({ locale }: { locale: string }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema) as Resolver<FormValues>,
    defaultValues: { employmentType: "FULL_TIME" },
  });

  const err = form.formState.errors;

  async function onSubmit(values: FormValues) {
    setSubmitting(true);
    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, publishNow: true }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        toast.error((body as { error?: string }).error ?? "Une erreur est survenue.");
        return;
      }

      toast.success("Offre d'emploi publiée !");
      router.push(`/${locale}/dashboard/salon/jobs`);
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

      {/* Title + type + pay */}
      <Card className="shadow-none">
        <CardHeader className="pb-2 pt-4 px-4 text-sm font-semibold">Poste</CardHeader>
        <CardContent className="px-4 pb-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="title">Titre du poste</Label>
            <Input
              id="title"
              placeholder="Ex: Toiletteur(se) expérimenté(e)"
              {...form.register("title")}
            />
            {err.title && <p className="text-xs text-destructive">{err.title.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label>Type d&apos;emploi</Label>
            <Controller
              control={form.control}
              name="employmentType"
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FULL_TIME">Temps plein</SelectItem>
                    <SelectItem value="PART_TIME">Temps partiel</SelectItem>
                    <SelectItem value="CONTRACT">Contrat</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="payInfo">Rémunération (optionnel)</Label>
            <Input
              id="payInfo"
              placeholder="Ex: 20–25 $/h"
              {...form.register("payInfo")}
            />
          </div>
        </CardContent>
      </Card>

      {/* Location */}
      <Card className="shadow-none">
        <CardHeader className="pb-2 pt-4 px-4 text-sm font-semibold">Lieu</CardHeader>
        <CardContent className="px-4 pb-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
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
        </CardContent>
      </Card>

      {/* Description + requirements */}
      <Card className="shadow-none">
        <CardHeader className="pb-2 pt-4 px-4 text-sm font-semibold">
          Description du poste
        </CardHeader>
        <CardContent className="px-4 pb-4 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              rows={5}
              placeholder="Décrivez le poste, l'ambiance du salon, les responsabilités…"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-y"
              {...form.register("description")}
            />
            {err.description && (
              <p className="text-xs text-destructive">{err.description.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="requirements">Exigences (optionnel)</Label>
            <textarea
              id="requirements"
              rows={3}
              placeholder="Ex: 2 ans d'expérience, certification ACMPR, etc."
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-y"
              {...form.register("requirements")}
            />
          </div>
        </CardContent>
      </Card>

      <div className="pt-2">
        <Button type="submit" disabled={submitting} className="min-w-[180px]">
          {submitting ? "Publication…" : "Publier l'offre"}
        </Button>
      </div>
    </form>
  );
}
