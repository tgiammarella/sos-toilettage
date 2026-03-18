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

export function JobEditForm({
  jobId,
  locale,
  initial,
}: {
  jobId: string;
  locale: string;
  initial: FormValues;
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const lang = locale === "en" ? "en" : "fr";

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema) as Resolver<FormValues>,
    defaultValues: initial,
  });

  const err = form.formState.errors;

  async function onSubmit(values: FormValues) {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/jobs/${jobId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, region: values.city }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        toast.error(
          (body as { error?: string }).error ??
            (lang === "fr" ? "Une erreur est survenue." : "An error occurred.")
        );
        return;
      }

      toast.success(
        lang === "fr" ? "Offre d'emploi mise à jour !" : "Job offer updated!"
      );
      router.push(`/${locale}/dashboard/salon/jobs/${jobId}`);
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {/* Title + type + pay */}
      <Card className="shadow-none">
        <CardHeader className="pb-2 pt-4 px-4 text-sm font-semibold">
          {lang === "fr" ? "Poste" : "Position"}
        </CardHeader>
        <CardContent className="px-4 pb-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="title">
              {lang === "fr" ? "Titre du poste" : "Job title"}
            </Label>
            <Input
              id="title"
              placeholder="Ex: Toiletteur(se) expérimenté(e)"
              {...form.register("title")}
            />
            {err.title && (
              <p className="text-xs text-destructive">{err.title.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label>{lang === "fr" ? "Type d'emploi" : "Employment type"}</Label>
            <Controller
              control={form.control}
              name="employmentType"
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FULL_TIME">
                      {lang === "fr" ? "Temps plein" : "Full time"}
                    </SelectItem>
                    <SelectItem value="PART_TIME">
                      {lang === "fr" ? "Temps partiel" : "Part time"}
                    </SelectItem>
                    <SelectItem value="CONTRACT">
                      {lang === "fr" ? "Contrat" : "Contract"}
                    </SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="payInfo">
              {lang === "fr" ? "Rémunération (optionnel)" : "Pay (optional)"}
            </Label>
            <Input
              id="payInfo"
              placeholder="Ex: 20–25 $/h"
              {...form.register("payInfo")}
            />
          </div>
        </CardContent>
      </Card>

      {/* Location — only city shown, region auto-derived */}
      <Card className="shadow-none">
        <CardHeader className="pb-2 pt-4 px-4 text-sm font-semibold">
          {lang === "fr" ? "Lieu" : "Location"}
        </CardHeader>
        <CardContent className="px-4 pb-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="city">{lang === "fr" ? "Ville" : "City"}</Label>
            <Input
              id="city"
              placeholder="Montréal"
              {...form.register("city")}
            />
            {err.city && (
              <p className="text-xs text-destructive">{err.city.message}</p>
            )}
          </div>
          {/* region hidden from UI but still in schema — auto-set to city on submit */}
          <input type="hidden" {...form.register("region")} />
        </CardContent>
      </Card>

      {/* Description + requirements */}
      <Card className="shadow-none">
        <CardHeader className="pb-2 pt-4 px-4 text-sm font-semibold">
          {lang === "fr" ? "Description du poste" : "Job description"}
        </CardHeader>
        <CardContent className="px-4 pb-4 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="description">
              {lang === "fr" ? "Description" : "Description"}
            </Label>
            <textarea
              id="description"
              rows={5}
              placeholder={
                lang === "fr"
                  ? "Décrivez le poste, l'ambiance du salon…"
                  : "Describe the role, salon environment…"
              }
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-y"
              {...form.register("description")}
            />
            {err.description && (
              <p className="text-xs text-destructive">{err.description.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="requirements">
              {lang === "fr" ? "Exigences (optionnel)" : "Requirements (optional)"}
            </Label>
            <textarea
              id="requirements"
              rows={3}
              placeholder={
                lang === "fr"
                  ? "Ex: 2 ans d'expérience…"
                  : "Ex: 2 years experience…"
              }
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-y"
              {...form.register("requirements")}
            />
          </div>
        </CardContent>
      </Card>

      <div className="pt-2">
        <Button type="submit" disabled={submitting} className="min-w-[180px]">
          {submitting
            ? lang === "fr" ? "Enregistrement…" : "Saving…"
            : lang === "fr" ? "Enregistrer les modifications" : "Save changes"}
        </Button>
      </div>
    </form>
  );
}
